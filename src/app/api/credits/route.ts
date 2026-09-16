// src/app/api/credits/route.ts
import { NextResponse } from "next/server";

const WAV_ACCESS_TOKEN = process.env.WAV_ACCESS_TOKEN;
const BASE_URL = "https://wav.am";

export async function GET() {
  try {
    if (!WAV_ACCESS_TOKEN) {
      return NextResponse.json({ credits: null, error: "No token" }, { status: 200 });
    }

    const response = await fetch(`${BASE_URL}/get_credits/`, {
      method: "POST",
      headers: {
        "Authorization": WAV_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("Credits API error:", response.status);
      return NextResponse.json({ credits: null }, { status: 200 });
    }

    const data = await response.json();
    const credits = data.credits || data.balance || data.remaining || null;

    return NextResponse.json({ credits });
  } catch (error) {
    console.warn("Credits error:", error);
    return NextResponse.json({ credits: null }, { status: 200 });
  }
}