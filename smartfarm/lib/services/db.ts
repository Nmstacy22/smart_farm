import { createClient } from '../supabase/client';

type DbObject = Record<string, unknown>;

const supabase = createClient();

const DEFAULT_IMAGE = '/images/corn-field.png';

async function getCount(table: string, filters: Record<string, unknown> = {}): Promise<number> {
  const query = supabase.from(table).select('id', { count: 'exact', head: true });
  Object.entries(filters).forEach(([key, value]) => query.eq(key, value));
  const { count, error } = await query;
  if (error) {
    console.error(`Supabase count error for ${table}:`, error);
    return 0;
  }
  return count ?? 0;
}

async function getTaskStatusId(name: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('task_statuses')
    .select('id')
    .eq('name', name)
    .limit(1)
    .single();

  if (error) {
    console.error('Supabase task status lookup failed:', error);
    return null;
  }

  return data?.id || null;
}

async function getOrCreateLivestockType(name: string, farmId: string): Promise<string | null> {
  if (!name) return null;
  const { data, error } = await supabase
    .from('livestock_types')
    .select('id')
    .eq('name', name)
    .eq('farm_id', farmId)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Supabase livestock type lookup failed:', error);
    return null;
  }

  if (data?.id) return data.id;

  const { data: inserted, error: insertError } = await supabase
    .from('livestock_types')
    .insert([{ name, farm_id: farmId }])
    .select('id')
    .limit(1)
    .single();

  if (insertError) {
    console.error('Supabase livestock type insert failed:', insertError);
    return null;
  }

  return inserted?.id || null;
}

/** Fetch the active farm owned or joined by the current authenticated user. */
async function getFarmId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Check if user has an active farm selected in localStorage
  let activeFarmId = null;
  if (typeof window !== 'undefined') {
    activeFarmId = localStorage.getItem('active_farm_id');
  }

  if (activeFarmId) {
    // Verify the user actually has access to this active farm
    const { data: roleData } = await supabase
      .from('farm_user_roles')
      .select('farm_id')
      .eq('user_id', user.id)
      .eq('farm_id', activeFarmId)
      .limit(1)
      .single();
    if (roleData?.farm_id) {
      return roleData.farm_id;
    } else {
      // Invalid or revoked access, clear it
      if (typeof window !== 'undefined') localStorage.removeItem('active_farm_id');
      activeFarmId = null;
    }
  }

  // 2. Fetch all farms the user has access to, ordered by creation (oldest first, typically Main Farm)
  // Actually, we'll just fetch the most recently joined/created one or just the first one.
  const { data: roleData, error: roleError } = await supabase
    .from('farm_user_roles')
    .select('farm_id')
    .eq('user_id', user.id)
    .limit(1);

  if (!roleError && roleData && roleData.length > 0) {
    const defaultFarmId = roleData[0].farm_id;
    if (typeof window !== 'undefined') localStorage.setItem('active_farm_id', defaultFarmId);
    return defaultFarmId;
  }

  // 3. Fallback: If no farm exists for this user, we return null so the frontend can prompt them.
  return null;
}

/** Fetch or create a default financial account for the farm. */
async function getFinancialAccountId(farmId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('financial_accounts')
    .select('id')
    .eq('farm_id', farmId)
    .limit(1)
    .single();

  if (!error && data?.id) return data.id;

  const { data: newAccount, error: insertError } = await supabase
    .from('financial_accounts')
    .insert([{ farm_id: farmId, name: 'Main Account', account_type: 'Cash' }])
    .select('id')
    .single();

  if (insertError) {
    console.error('[getFinancialAccountId] Failed to create default account:', insertError);
    return null;
  }

  return newAccount?.id || null;
}

export const dbService = {
  async createFarm(name: string): Promise<{ id: string } | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: newFarmData, error: insertError } = await supabase
      .from('farm')
      .insert([{ name: name || 'My Farm' }])
      .select('id')
      .single();

    if (insertError || !newFarmData?.id) {
      console.error('Failed to create farm:', insertError);
      return null;
    }

    // Link the user to the new farm as an owner
    await supabase.from('farm_user_roles').insert([{
      farm_id: newFarmData.id,
      user_id: user.id,
      role: 'owner'
    }]);

    if (typeof window !== 'undefined') {
      localStorage.setItem('active_farm_id', newFarmData.id);
    }
    return { id: newFarmData.id };
  },

  async getOverviewStats(): Promise<{ fields: number; workers: number; tasks: number }> {
    const [fields, workers, tasks] = await Promise.all([
      getCount('fields'),
      getCount('farm_user_roles'),
      getCount('tasks'),
    ]);

    return {
      fields,
      workers,
      tasks,
    };
  },

  async getFields(): Promise<DbObject[]> {
    const farmId = await getFarmId();
    if (!farmId) return [];
    const { data, error } = await supabase.from('fields').select('*').eq('farm_id', farmId).order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase Fields Read Error:', error);
      return [];
    }
    return data.map((field: DbObject) => ({
      ...field,
      title: field.name,
      crop:
        typeof field.crop === 'string'
          ? field.crop
          : typeof field.notes === 'string'
          ? field.notes.split(' ')[0]
          : 'Crop',
      area: field.area_ha ? `${field.area_ha} ha` : '0 ha',
      workers: field.workers ?? 0,
      status: field.status || 'healthy',
      moisture: field.moisture ?? 0,
      image: field.image || DEFAULT_IMAGE,
    }));
  },

  async createField(item: DbObject): Promise<DbObject | null> {
    const farmId = await getFarmId();
    if (!farmId) {
      console.error('[createField] No farm_id found — cannot insert field.');
      return null;
    }

    const fieldPayload: DbObject = {
      farm_id: farmId,
      name: item.title,
      area_ha:
        typeof item.area === 'string' ? Number(item.area.replace(' ha', '')) || null : null,
      notes: item.crop,
    };

    const { data, error } = await supabase.from('fields').insert([fieldPayload]).select();
    if (error) {
      console.error('[createField] Supabase error:', JSON.stringify(error, null, 2));
      return null;
    }
    return {
      ...data?.[0],
      title: data?.[0]?.name,
      crop: item.crop,
      area: item.area,
      workers: item.workers || 0,
      status: item.status || 'healthy',
      moisture: item.moisture ?? 0,
      image: item.image || DEFAULT_IMAGE,
    };
  },

  async updateField(id: string, updates: DbObject): Promise<DbObject | null> {
    const payload: DbObject = {};
    if (updates.title) payload.name = updates.title;
    if (typeof updates.area === 'string') payload.area_ha = Number(updates.area.replace(' ha', '')) || null;
    if (updates.crop) payload.notes = updates.crop;

    const { data, error } = await supabase.from('fields').update(payload).eq('id', id).select();
    if (error) {
      console.error('Supabase Field Update Error:', error);
      return null;
    }
    return {
      ...data?.[0],
      title: data?.[0]?.name,
      crop: data?.[0]?.notes,
      area: data?.[0]?.area_ha ? `${data[0].area_ha} ha` : '0 ha',
      workers: updates.workers ?? data?.[0]?.workers ?? 0,
      status: updates.status || data?.[0]?.status || 'healthy',
      moisture: updates.moisture ?? data?.[0]?.moisture ?? 0,
      image: updates.image || data?.[0]?.image || DEFAULT_IMAGE,
    };
  },

  async deleteField(id: string): Promise<boolean> {
    const { error } = await supabase.from('fields').delete().eq('id', id);
    if (error) {
      console.error('Supabase Field Delete Error:', error);
      return false;
    }
    return true;
  },

  async getLivestock(): Promise<DbObject[]> {
    const farmId = await getFarmId();
    if (!farmId) return [];
    const { data, error } = await supabase
      .from('livestock_units')
      .select('*, type:livestock_types(name)')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Livestock Read Error:', error);
      return [];
    }

    return data.map((item: DbObject) => ({
      id: item.id,
      name: item.name,
      type: typeof item.type === 'object' && item.type !== null ? (item.type as DbObject).name || 'Livestock' : 'Livestock',
      count: item.count ?? 0,
      status: item.status || 'healthy',
      feed: item.feed || 'Standard diet',
      health_check: item.health_check || null,
    }));
  },

  async createLivestock(item: DbObject): Promise<DbObject | null> {
    const farmId = await getFarmId();
    if (!farmId) {
      console.error('[createLivestock] No farm_id found — cannot insert livestock.');
      return null;
    }

    const typeId = await getOrCreateLivestockType((item.type as string) || 'Livestock', farmId);
    const payload: DbObject = {
      farm_id: farmId,
      name: item.name,
      livestock_type_id: typeId,
    };
    const { data, error } = await supabase.from('livestock_units').insert([payload]).select();
    if (error) {
      console.error('Supabase Livestock Insert Error:', JSON.stringify(error, null, 2));
      return null;
    }
    return {
      id: data?.[0]?.id,
      name: data?.[0]?.name,
      type: item.type,
      count: item.count ?? 0,
      status: item.status || 'healthy',
      feed: item.feed || 'Standard diet',
      health_check: item.health_check || null,
    };
  },

  async updateLivestock(id: string, updates: DbObject): Promise<DbObject | null> {
    const payload: DbObject = {};
    if (updates.name) payload.name = updates.name;
    if (updates.type) {
      const farmId = await getFarmId();
      if (farmId) {
        const typeId = await getOrCreateLivestockType(updates.type as string, farmId);
        if (typeId) payload.livestock_type_id = typeId;
      }
    }

    const { data, error } = await supabase.from('livestock_units').update(payload).eq('id', id).select();
    if (error) {
      console.error('Supabase Livestock Update Error:', error);
      return null;
    }
    const record = data?.[0] || {};
    return {
      id: record.id,
      name: record.name,
      type: updates.type || record.type?.name || 'Livestock',
      count: updates.count ?? record.count ?? 0,
      status: updates.status || record.status || 'healthy',
      feed: updates.feed || record.feed || 'Standard diet',
      health_check: updates.health_check || record.health_check || null,
    };
  },

  async deleteLivestock(id: string): Promise<boolean> {
    const { error } = await supabase.from('livestock_units').delete().eq('id', id);
    if (error) {
      console.error('Supabase Livestock Delete Error:', error);
      return false;
    }
    return true;
  },

  async getInventory(): Promise<DbObject[]> {
    const farmId = await getFarmId();
    if (!farmId) return [];
    const { data, error } = await supabase.from('inventory_items').select('*').eq('farm_id', farmId).order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase Inventory Read Error:', error);
      return [];
    }
    return data.map((item: DbObject) => ({
      id: item.id,
      name: item.name,
      category: item.item_type || 'Inventory',
      qty: item.qty ?? 0,
      unit: item.unit || 'pcs',
      lowStock: item.low_stock ?? item.lowStock ?? false,
    }));
  },

  async createInventoryItem(item: DbObject): Promise<DbObject | null> {
    const farmId = await getFarmId();
    if (!farmId) {
      console.error('[createInventoryItem] No farm_id found.');
      return null;
    }

    const payload: DbObject = {
      farm_id: farmId,
      name: item.name,
      item_type: item.category,
      sku: item.sku || null,
    };
    
    // Note: If qty, unit, low_stock columns don't exist in Supabase yet, this will succeed
    // but the frontend will read them as undefined/0 on next fetch.
    const { data, error } = await supabase.from('inventory_items').insert([payload]).select();
    if (error) {
      console.error('Supabase Inventory Insert Error:', error);
      return null;
    }
    return {
      id: data?.[0]?.id,
      name: data?.[0]?.name,
      category: item.category,
      qty: item.qty ?? 0, // Fallback to provided quantity so UI updates optimistically if needed
      unit: item.unit || 'pcs',
      lowStock: item.lowStock ?? false,
    };
  },

  async updateInventoryItem(id: string, updates: DbObject): Promise<DbObject | null> {
    const payload: DbObject = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.category !== undefined) payload.item_type = updates.category;
    if (updates.sku !== undefined) payload.sku = updates.sku;

    const { data, error } = await supabase.from('inventory_items').update(payload).eq('id', id).select();
    if (error) {
      console.error('Supabase Inventory Update Error:', error);
      return null;
    }
    const record = data?.[0] || {};
    return {
      id: record.id,
      name: record.name,
      category: updates.category || record.item_type || 'Inventory',
      qty: updates.qty ?? record.qty ?? 0,
      unit: updates.unit || record.unit || 'pcs',
      lowStock: updates.lowStock ?? record.lowStock ?? false,
    };
  },

  async deleteInventoryItem(id: string): Promise<boolean> {
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (error) {
      console.error('Supabase Inventory Delete Error:', error);
      return false;
    }
    return true;
  },

  async getTransactions(): Promise<DbObject[]> {
    const farmId = await getFarmId();
    if (!farmId) return [];
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*, category:financial_transaction_categories(*)')
      .eq('farm_id', farmId)
      .order('occurred_on', { ascending: false });

    if (error) {
      console.error('Supabase Transactions Read Error:', error);
      return [];
    }

    return data.map((tx: DbObject) => ({
      ...tx,
      type: tx.transaction_type || 'income',
      description: tx.memo || '',
      date: tx.occurred_on || null,
      status: tx.status || 'paid',
      payment_method: tx.payment_method || 'other',
      category: tx.category || { name: 'Uncategorized' },
    }));
  },

  async createTransaction(tx: DbObject): Promise<DbObject | null> {
    const farmId = await getFarmId();
    if (!farmId) {
      console.error('[createTransaction] No farm_id found — cannot insert transaction.');
      return null;
    }

    const accountId = await getFinancialAccountId(farmId);
    if (!accountId) {
      console.error('[createTransaction] No account_id found — cannot insert transaction.');
      return null;
    }

    const payload: DbObject = {
      farm_id: farmId,
      account_id: accountId,
      transaction_type: tx.type,
      amount: tx.amount,
      memo: tx.description,
      occurred_on: tx.date,
      category_id: tx.category_id,
      currency: tx.currency || 'XAF',
    };
    const { data, error } = await supabase.from('financial_transactions').insert([payload]).select();
    if (error) {
      console.error('Supabase Transaction Insert Error:', JSON.stringify(error, null, 2));
      return null;
    }
    const created = data?.[0];
    return {
      ...created,
      type: created.transaction_type,
      description: created.memo,
      date: created.occurred_on,
      status: created.status || tx.status || 'paid',
      payment_method: created.payment_method || tx.payment_method || 'other',
      category: tx.category || { name: 'Uncategorized' },
    };
  },

  async updateTransaction(id: string, updates: DbObject): Promise<DbObject | null> {
    const payload: DbObject = {};
    if (updates.type) payload.transaction_type = updates.type;
    if (updates.description) payload.memo = updates.description;
    if (updates.date) payload.occurred_on = updates.date;
    if (updates.category_id) payload.category_id = updates.category_id;
    if (updates.currency) payload.currency = updates.currency;

    const { data, error } = await supabase.from('financial_transactions').update(payload).eq('id', id).select();
    if (error) {
      console.error('Supabase Transaction Update Error:', error);
      return null;
    }
    const updated = data?.[0];
    return {
      ...updated,
      type: updated.transaction_type,
      description: updated.memo,
      date: updated.occurred_on,
      status: updated.status || updates.status || 'paid',
      payment_method: updated.payment_method || updates.payment_method || 'other',
      category: updated.category || { name: 'Uncategorized' },
    };
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const { error } = await supabase.from('financial_transactions').delete().eq('id', id);
    if (error) {
      console.error('Supabase Transaction Delete Error:', error);
      return false;
    }
    return true;
  },

  async getCategories(): Promise<DbObject[]> {
    const farmId = await getFarmId();
    if (!farmId) return [];
    const { data, error } = await supabase
      .from('financial_transaction_categories')
      .select('id, name, description')
      .eq('farm_id', farmId);
    if (error) {
      console.error('Supabase Categories Read Error:', error);
      return [];
    }
    return (data || []).map((category: DbObject) => ({
      id: category.id,
      name: category.name || 'Uncategorized',
      description: category.description || '',
    }));
  },

  async getTasks(): Promise<DbObject[]> {
    const farmId = await getFarmId();
    if (!farmId) return [];
    const { data, error } = await supabase
      .from('tasks')
      .select('*, status:task_statuses(name), task_assignments(worker_user_id)')
      .eq('farm_id', farmId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Supabase Tasks Read Error:', error);
      return [];
    }

    // Fetch user profiles to resolve names
    const userIds = [
      ...new Set(data.map((t: any) => t.task_assignments?.[0]?.worker_user_id).filter(Boolean))
    ];
    let profilesMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('user_profile').select('id, full_name').in('id', userIds);
      if (profiles) {
        profiles.forEach(p => {
          if (p.full_name) profilesMap[p.id] = p.full_name;
        });
      }
    }

    return data.map((task: DbObject) => {
      const statusObj = task.status as DbObject | undefined;
      const assignments = task.task_assignments as any[] | undefined;
      const assigneeId = assignments && assignments.length > 0 ? assignments[0].worker_user_id as string : null;
      const assigneeLabel = assigneeId 
        ? (profilesMap[assigneeId] || assigneeId.slice(0, 8) + '…')
        : 'Unassigned';
      
      return {
        ...task,
        status: typeof statusObj?.name === 'string' ? statusObj.name : 'pending',
        dueDate: task.due_date || null,
        assignee: task.assignee || assigneeLabel,
        assignee_id: assigneeId,
      };
    });
  },

  async createTask(task: DbObject): Promise<DbObject | null> {
    const farmId = await getFarmId();
    if (!farmId) {
      console.error('[createTask] No farm_id found.');
      return null;
    }

    const statusId = await getTaskStatusId((task.status as string) || 'pending');
    const payload: DbObject = {
      farm_id: farmId,
      title: task.title,
      due_date: task.due_date,
      created_by: task.created_by || null,
      status_id: statusId,
    };
    const { data, error } = await supabase.from('tasks').insert([payload]).select();
    if (error) {
      console.error('Supabase Task Insert Error:', error);
      return null;
    }
    const created = data?.[0];

    if (created && task.assignee_id) {
      await supabase.from('task_assignments').insert({
        farm_id: farmId,
        task_id: created.id,
        worker_user_id: task.assignee_id
      });
    }

    return {
      ...created,
      status: task.status || 'pending',
      dueDate: created.due_date || task.due_date,
      assignee: task.assignee || 'Unassigned',
    };
  },

  async updateTask(id: string, updates: DbObject): Promise<DbObject | null> {
    const payload: DbObject = {};
    if (updates.title) payload.title = updates.title;
    if (updates.dueDate) payload.due_date = updates.dueDate;
    if (typeof updates.status === 'string') {
      const statusId = await getTaskStatusId(updates.status);
      if (statusId) payload.status_id = statusId;
    }

    const { data, error } = await supabase.from('tasks').update(payload).eq('id', id).select();
    if (error) {
      console.error('Supabase Task Update Error:', error);
      return null;
    }
    const updated = data?.[0];

    if (updated && updates.assignee_id !== undefined) {
      const farmId = await getFarmId();
      // Delete old assignments
      await supabase.from('task_assignments').delete().eq('task_id', id);
      if (updates.assignee_id) {
        await supabase.from('task_assignments').insert({
          farm_id: farmId,
          task_id: id,
          worker_user_id: updates.assignee_id
        });
      }
    }

    return {
      ...updated,
      status: updates.status || updated.status || 'pending',
      dueDate: updated.due_date || updates.dueDate,
      assignee: updated.assignee || 'Unassigned',
    };
  },

  async deleteTask(id: string): Promise<boolean> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('Supabase Task Delete Error:', error);
      return false;
    }
    return true;
  },

  async getFarmProfile(): Promise<{id: string, name: string, location?: string, currentUserRole?: string, currentUserId?: string} | null> {
    const farmId = await getFarmId();
    if (!farmId) return null;
    
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase.from('farm').select('id, name, country, region').eq('id', farmId).single();
    if (error) return null;
    const d = data as any;
    
    let currentUserRole = 'worker';
    if (user) {
      const { data: roleData } = await supabase.from('farm_user_roles').select('role').eq('farm_id', farmId).eq('user_id', user.id).single();
      if (roleData?.role) {
        currentUserRole = roleData.role;
      }
    }

    return {
      id: d.id,
      name: d.name,
      location: [d.region, d.country].filter(Boolean).join(', ') || undefined,
      currentUserRole,
      currentUserId: user?.id
    };
  },

  async updateFarmProfile(updates: { name?: string; location?: string }): Promise<boolean> {
    const farmId = await getFarmId();
    if (!farmId) return false;
    const payload: DbObject = {};
    if (updates.name) payload.name = updates.name;
    // location is stored as "region, country" — split on first comma
    if (updates.location !== undefined) {
      const parts = updates.location.split(',').map((s) => s.trim());
      payload.region = parts[0] || null;
      payload.country = parts[1] || null;
    }
    const { error } = await supabase.from('farm').update(payload).eq('id', farmId);
    if (error) {
      console.error('Supabase Farm Profile Update Error:', error);
      return false;
    }
    return true;
  },

  async getFarmTeam(): Promise<any[]> {
    const farmId = await getFarmId();
    if (!farmId) return [];
    const { data, error } = await supabase
      .from('farm_user_roles')
      .select('role, user_id')
      .eq('farm_id', farmId);
    if (error) return [];
    
    const userIds = data.map((r: any) => r.user_id);
    let profilesMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('user_profile').select('id, full_name').in('id', userIds);
      if (profiles) {
        profiles.forEach(p => {
          if (p.full_name) profilesMap[p.id] = p.full_name;
        });
      }
    }

    return (data || []).map((row: any) => ({
      ...row,
      users: { email: profilesMap[row.user_id] || row.user_id.slice(0, 8) + '…' },
    }));
  },

  async joinFarm(joinCode: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Check if farm exists
    const { data: farm, error: farmError } = await supabase.from('farm').select('id').eq('id', joinCode).single();
    if (farmError || !farm) return { success: false, error: 'Invalid Join Code' };

    // Check if already a member
    const { data: existing } = await supabase.from('farm_user_roles').select('id').eq('farm_id', joinCode).eq('user_id', user.id).single();
    if (existing) return { success: false, error: 'You are already a member of this farm' };

    // Insert
    const { error: insertError } = await supabase.from('farm_user_roles').insert({
      farm_id: joinCode,
      user_id: user.id,
      role: 'worker'
    });

    if (insertError) {
      return { success: false, error: 'Failed to join farm' };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('active_farm_id', joinCode);
    }

    return { success: true };
  },

  async getReportsSummary(): Promise<any> {
    const farmId = await getFarmId();
    if (!farmId) return null;

    // Get finance
    const { data: tx } = await supabase.from('financial_transactions').select('amount, transaction_type, occurred_on').eq('farm_id', farmId);
    
    // Group tx by month
    const financeMap: Record<string, any> = {};
    (tx || []).forEach((t: any) => {
      const date = new Date(t.occurred_on);
      const month = date.toLocaleString('default', { month: 'short' });
      if (!financeMap[month]) financeMap[month] = { date: month, income: 0, expense: 0 };
      if (t.transaction_type === 'income') financeMap[month].income += Number(t.amount);
      else financeMap[month].expense += Number(t.amount);
    });

    // Get inventory
    const { data: inv } = await supabase.from('inventory_items').select('item_type, qty').eq('farm_id', farmId);
    const invMap: Record<string, number> = {};
    (inv || []).forEach((i: any) => {
      const cat = i.item_type || 'Other';
      invMap[cat] = (invMap[cat] || 0) + Number(i.qty || 0);
    });
    const inventory = Object.entries(invMap).map(([name, value]) => ({ name, value }));

    // Get crops
    const { count: fields } = await supabase.from('fields').select('*', { count: 'exact', head: true }).eq('farm_id', farmId);
    const { data: fieldData } = await supabase.from('fields').select('area_ha').eq('farm_id', farmId);
    const area = (fieldData || []).reduce((sum: number, f: any) => sum + Number(f.area_ha || 0), 0);

    // Get livestock
    const { data: liveData } = await supabase.from('livestock_units').select('count, status').eq('farm_id', farmId);
    const totalLive = (liveData || []).reduce((sum: number, l: any) => sum + Number(l.count || 0), 0);
    const healthyLive = (liveData || []).filter((l: any) => l.status === 'healthy').length;

    return {
      finance: Object.values(financeMap),
      inventory,
      crops: { fields: fields || 0, area },
      livestock: { total: totalLive, healthy: healthyLive, herds: liveData?.length || 0 }
    };
  }
};
