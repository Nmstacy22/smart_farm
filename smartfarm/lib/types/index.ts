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
