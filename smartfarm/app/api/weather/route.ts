import type { NextRequest } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { sampleWeatherReport, toWeatherReport } from '../../../lib/weather/forecast';

/**
 * Current weather + 5-day forecast for a location, e.g. /api/weather?location=Buea.
 * Proxies OpenWeatherMap so OPENWEATHER_API_KEY stays on the server. Signed-in users only,
 * so the API quota can't be used by anyone on the internet. Without a key it returns
 * sample data (marked `sample: true`) so the page still works in development.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const location = (request.nextUrl.searchParams.get('location') || '').trim().slice(0, 100)
    || process.env.NEXT_PUBLIC_WEATHER_LOCATION || 'Buea';

  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return Response.json(sampleWeatherReport(location));

  // Weather changes slowly; cache upstream responses for 10 minutes per location
  const fetchBoth = (q: string) => {
    const query = `q=${encodeURIComponent(q)}&units=metric&appid=${key}`;
    return Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?${query}`, { next: { revalidate: 600 } }),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?${query}`, { next: { revalidate: 600 } }),
    ]);
  };

  let [currentRes, forecastRes] = await fetchBoth(location);
  // Farm locations are stored as "Region, Country" (e.g. "Buea, Cameroon"), and OpenWeatherMap
  // doesn't always recognise full country names, so fall back to the part before the comma
  if ((currentRes.status === 404 || forecastRes.status === 404) && location.includes(',')) {
    [currentRes, forecastRes] = await fetchBoth(location.split(',')[0].trim());
  }

  if (currentRes.status === 404 || forecastRes.status === 404) {
    return Response.json({ error: `Location "${location}" not found` }, { status: 404 });
  }
  if (!currentRes.ok || !forecastRes.ok) {
    return Response.json({ error: 'Weather service unavailable' }, { status: 502 });
  }

  return Response.json(toWeatherReport(await currentRes.json(), await forecastRes.json()));
}
