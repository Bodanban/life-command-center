import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  const city = process.env.NEXT_PUBLIC_DEFAULT_CITY || 'Paris';

  if (!apiKey || apiKey === 'your_openweathermap_api_key_here') {
    return NextResponse.json(
      { error: 'OpenWeatherMap API key not configured' },
      { status: 503 }
    );
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=fr`;
    const res = await fetch(url, { next: { revalidate: 1800 } });

    if (!res.ok) {
      throw new Error(`Weather API responded with ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      temp: data.main.temp,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6), // m/s to km/h
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
