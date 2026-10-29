// Turns a forecast into practical farm advice. These are general agronomy rules of thumb,
// not crop-specific recommendations; the thresholds are grouped below so they're easy to tune.
import type { WeatherReport, ForecastSlot } from './forecast';

export type Advice = {
  id: string;
  level: 'good' | 'warning' | 'info';
  title: string;
  detail: string;
  category: 'spraying' | 'rain' | 'irrigation' | 'livestock' | 'disease' | 'planting' | 'wind';
};

const T = {
  sprayMaxWindKph: 15, // drift risk above this
  sprayMinWindKph: 3, // inversion/drift risk in dead calm
  sprayMaxPop: 0.3, // chance of rain during application
  sprayRainFreeHours: 6, // products need time to dry/absorb
  washOffRainMm: 5, // rain in next 24h that would wash off inputs
  heavyRainDayMm: 20,
  plantingRainDayMinMm: 5,
  plantingRainDayMaxMm: 20,
  dryTotalMm: 5, // 5-day total considered dry
  hotDayC: 30,
  heatStressC: 32,
  diseaseHumidity: 85,
  diseaseMinC: 15,
  diseaseMaxC: 28,
  strongWindKph: 40,
};

const dayName = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'long' });
const slotLabel = (s: ForecastSlot) =>
  new Date(s.time).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' });

/** First daytime slot that is calm, dry, and followed by enough dry hours. */
function findSprayWindow(slots: ForecastSlot[]): ForecastSlot | null {
  const followUp = T.sprayRainFreeHours / 3;
  for (let i = 0; i < slots.length - followUp; i++) {
    const s = slots[i];
    const hour = new Date(s.time).getHours();
    if (hour < 6 || hour > 15) continue; // daylight, leaving time to finish before dusk
    const calm = s.windKph >= T.sprayMinWindKph && s.windKph <= T.sprayMaxWindKph;
    const dryAfter = slots.slice(i, i + 1 + followUp).every((x) => x.rainMm < 0.5 && x.pop <= T.sprayMaxPop);
    if (calm && dryAfter) return s;
  }
  return null;
}

export function getFarmAdvice(report: WeatherReport): Advice[] {
  const advice: Advice[] = [];
  const { slots, days } = report;
  if (slots.length === 0) return advice;

  // Spraying / fertilizer timing
  const rainNext24h = slots.slice(0, 8).reduce((sum, s) => sum + s.rainMm, 0);
  if (rainNext24h >= T.washOffRainMm) {
    advice.push({
      id: 'washoff', level: 'warning', category: 'spraying',
      title: 'Hold off on spraying and top-dressing',
      detail: `About ${Math.round(rainNext24h)} mm of rain is expected in the next 24 hours and would wash off pesticides and fertilizer.`,
    });
  }
  const window = findSprayWindow(slots);
  advice.push(window
    ? {
        id: 'spray', level: 'good', category: 'spraying',
        title: `Best spraying window: ${slotLabel(window)}`,
        detail: `Light wind (${window.windKph} km/h) and at least ${T.sprayRainFreeHours} dry hours afterwards.`,
      }
    : {
        id: 'spray', level: 'info', category: 'spraying',
        title: 'No good spraying window in the next 5 days',
        detail: 'Every daytime slot is either rainy or too windy. Check again tomorrow.',
      });

  // Heavy rain
  const heavy = days.filter((d) => d.rainMm >= T.heavyRainDayMm);
  if (heavy.length > 0) {
    advice.push({
      id: 'heavy-rain', level: 'warning', category: 'rain',
      title: `Heavy rain on ${heavy.map((d) => dayName(d.date)).join(', ')}`,
      detail: 'Clear drainage channels, protect seedlings and nursery beds, and avoid drying harvests outdoors.',
    });
  }

  // Planting conditions: steady, moderate rain
  const plantingDays = days.filter((d) => d.rainMm >= T.plantingRainDayMinMm && d.rainMm < T.plantingRainDayMaxMm);
  if (plantingDays.length >= 2 && heavy.length === 0) {
    advice.push({
      id: 'planting', level: 'good', category: 'planting',
      title: 'Good conditions for planting and transplanting',
      detail: `Steady rain is expected on ${plantingDays.map((d) => dayName(d.date)).join(', ')}, which will keep soil moist for new plants.`,
    });
  }

  // Dry spell / irrigation
  const totalRain = days.reduce((sum, d) => sum + d.rainMm, 0);
  const hottest = Math.max(...days.map((d) => d.max));
  if (totalRain < T.dryTotalMm && hottest >= T.hotDayC) {
    advice.push({
      id: 'irrigation', level: 'warning', category: 'irrigation',
      title: 'Dry, hot spell ahead: plan irrigation',
      detail: `Less than ${T.dryTotalMm} mm of rain in the next 5 days with highs up to ${hottest}°C. Water early morning or evening and mulch to keep moisture in.`,
    });
  }

  // Livestock heat stress
  const hotDays = days.filter((d) => d.max >= T.heatStressC);
  if (hotDays.length > 0) {
    advice.push({
      id: 'heat', level: 'warning', category: 'livestock',
      title: `Heat stress risk on ${hotDays.map((d) => dayName(d.date)).join(', ')}`,
      detail: 'Give animals shade and extra clean water, and move handling and field work to cooler hours.',
    });
  }

  // Fungal disease pressure: warm and very humid for at least two days
  const humidDays = days.filter((d) => d.humidity >= T.diseaseHumidity && d.max <= T.diseaseMaxC + 4 && d.min >= T.diseaseMinC - 2);
  if (humidDays.length >= 2) {
    advice.push({
      id: 'disease', level: 'warning', category: 'disease',
      title: 'High fungal disease risk',
      detail: 'Warm, humid weather favours diseases such as cocoa black pod and tomato or potato blight. Scout crops and apply preventive treatment in a dry window.',
    });
  }

  // Strong wind
  const windy = days.filter((d) => d.windKph >= T.strongWindKph);
  if (windy.length > 0) {
    advice.push({
      id: 'wind', level: 'warning', category: 'wind',
      title: `Strong wind on ${windy.map((d) => dayName(d.date)).join(', ')}`,
      detail: 'Secure greenhouse covers, shade nets and loose roofing, and stake tall crops such as maize and plantain.',
    });
  }

  return advice;
}
