// app/api/bland-call/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // expect { anomaly, phone_number? }
    const anomaly = body.anomaly || {};
    const phone_number = body.phone_number || '+918468845787';

    const BLAND_KEY = process.env.BLAND_API_KEY;
    if (!BLAND_KEY) {
      return NextResponse.json({ error: 'Bland API key not configured' }, { status: 500 });
    }

    const headers = {
      authorization: BLAND_KEY, // Bland expects 'authorization' header with the API key
      'Content-Type': 'application/json'
    };

    const data = {
      phone_number,
      voice: 'e1289219-0ea2-4f22-a994-c542c2a48a0f',
      wait_for_greeting: false,
      record: true,
      answered_by_enabled: true,
      noise_cancellation: false,
      interruption_threshold: 500,
      block_interruptions: false,
      max_duration: 12,
      model: 'base',
      language: 'en',
      background_track: 'none',
      endpoint: 'https://api.bland.ai',
      voicemail_action: 'hangup',
      pathway_id: '24ed795d-5b46-40a0-bab7-2948a470bc1f',
      // optionally include anomaly details for your pathway to read
      metadata: { anomaly }
    };

    const resp = await axios.post('https://api.bland.ai/v1/calls', data, { headers });
    return NextResponse.json({ ok: true, data: resp.data }, { status: 200 });

  } catch (err: any) {
    console.error('Server Bland call error:', err?.response?.data ?? err.message ?? err);
    const status = err?.response?.status || 500;
    const data = err?.response?.data || { message: err?.message || 'unknown error' };
    return NextResponse.json({ error: data }, { status });
  }
}
