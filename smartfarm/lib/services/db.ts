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

async function getOrCreateLivestockType(name: string): Promise<string | null> {
  if (!name) return null;
  const { data, error } = await supabase
    .from('livestock_types')
    .select('id')
    .eq('name', name)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Supabase livestock type lookup failed:', error);
    return null;
  }

  if (data?.id) return data.id;

  const { data: inserted, error: insertError } = await supabase
    .from('livestock_types')
    .insert([{ name }])
    .select('id')
    .limit(1)
    .single();

  if (insertError) {
    console.error('Supabase livestock type insert failed:', insertError);
    return null;
  }

  return inserted?.id || null;
}

export const dbService = {
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
    const { data, error } = await supabase.from('fields').select('*').order('created_at', { ascending: false });
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
    const fieldPayload: DbObject = {
      name: item.title,
      area_ha:
        typeof item.area === 'string' ? Number(item.area.replace(' ha', '')) || null : null,
      notes: item.crop,
    };
    const { data, error } = await supabase.from('fields').insert([fieldPayload]).select();
    if (error) {
      console.error('Supabase Field Insert Error:', error);
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
    const { data, error } = await supabase
      .from('livestock_units')
      .select('*, type:livestock_types(name)')
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
    const typeId = await getOrCreateLivestockType((item.type as string) || 'Livestock');
    const payload: DbObject = {
      name: item.name,
      livestock_type_id: typeId,
      external_tag: item.external_tag || null,
    };
    const { data, error } = await supabase.from('livestock_units').insert([payload]).select();
    if (error) {
      console.error('Supabase Livestock Insert Error:', error);
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
      const typeId = await getOrCreateLivestockType(updates.type as string);
      if (typeId) payload.livestock_type_id = typeId;
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
    const { data, error } = await supabase.from('inventory_items').select('*').order('created_at', { ascending: false });
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
      lowStock: item.lowStock ?? false,
    }));
  },

  async createInventoryItem(item: DbObject): Promise<DbObject | null> {
    const payload: DbObject = {
      name: item.name,
      item_type: item.category,
      sku: item.sku || null,
    };
    const { data, error } = await supabase.from('inventory_items').insert([payload]).select();
    if (error) {
      console.error('Supabase Inventory Insert Error:', error);
      return null;
    }
    return {
      id: data?.[0]?.id,
      name: data?.[0]?.name,
      category: item.category,
      qty: item.qty ?? 0,
      unit: item.unit || 'pcs',
      lowStock: item.lowStock ?? false,
    };
  },

  async updateInventoryItem(id: string, updates: DbObject): Promise<DbObject | null> {
    const payload: DbObject = {};
    if (updates.name) payload.name = updates.name;
    if (updates.category) payload.item_type = updates.category;
    if (updates.sku) payload.sku = updates.sku;

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
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*, category:financial_transaction_categories(*)')
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
    const payload: DbObject = {
      transaction_type: tx.type,
      amount: tx.amount,
      memo: tx.description,
      occurred_on: tx.date,
      category_id: tx.category_id,
      currency: tx.currency || 'XAF',
    };
    const { data, error } = await supabase.from('financial_transactions').insert([payload]).select();
    if (error) {
      console.error('Supabase Transaction Insert Error:', error);
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
    const { data, error } = await supabase.from('financial_transaction_categories').select('*');
    if (error) {
      console.error('Supabase Categories Read Error:', error);
      return [];
    }
    return data.map((category: DbObject) => ({
      icon: category.icon || 'circle-dollar-sign',
    }));
  },

  async getTasks(): Promise<DbObject[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, status:task_statuses(name)')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Supabase Tasks Read Error:', error);
      return [];
    }

    return data.map((task: DbObject) => {
      const statusObj = task.status as DbObject | undefined;
      return {
        ...task,
        status: typeof statusObj?.name === 'string' ? statusObj.name : 'pending',
        dueDate: task.due_date || null,
        assignee: task.assignee || 'Unassigned',
      };
    });
  },

  async createTask(task: DbObject): Promise<DbObject | null> {
    const statusId = await getTaskStatusId((task.status as string) || 'pending');
    const payload: DbObject = {
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
};
