export type Field = {
  id?: string;
  title: string;
  crop: string;
  area: string;
  workers: number;
  status: 'healthy' | 'attention' | 'critical';
  moisture: number;
  image?: string;
};

export type Livestock = {
  id?: string;
  name: string;
  type: string;
  count: number;
  status: 'healthy' | 'sick' | 'quarantine';
  feed: string;
  health_check: string;
};

export type Activity = {
  id?: string;
  farm_id?: string;
  date: string;
  description: string;
  person_responsible: string;
};

export type TeamRole = 'owner' | 'manager' | 'worker';

export type TeamMember = {
  id: string; // farm_user_roles row id
  user_id: string;
  role: TeamRole;
  joined_at: string;
  name: string; // full name, falling back to email
  email: string | null;
  phone: string | null;
  users: { email: string }; // legacy display-name field used by older components
};

export type MarketPrice = {
  id: string;
  commodity: string;
  market: string | null;
  unit: string;
  price: number;
  currency: string;
  observed_on: string; // YYYY-MM-DD
  notes: string | null;
  recorded_by: string | null;
};

export type FarmMessage = {
  id: string;
  author_id: string;
  body: string;
  is_announcement: boolean;
  created_at: string;
};
