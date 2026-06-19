import { useState, useEffect } from 'react';
import { dbService } from '../services/db';

export function useFarm() {
  const [profile, setProfile] = useState<{id: string, name: string, location?: string, currentUserRole?: string} | null>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFarmData() {
      setLoading(true);
      try {
        const p = await dbService.getFarmProfile();
        setProfile(p);
        const t = await dbService.getFarmTeam();
        setTeam(t);
      } catch (e) {
        console.error("Failed to load farm data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchFarmData();
  }, []);

  return { 
    profile, 
    team, 
    loading, 
    currentUserRole: profile?.currentUserRole || 'worker'
  };
}
