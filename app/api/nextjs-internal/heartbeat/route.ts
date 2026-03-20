import { NextResponse } from 'next/server'

// Fake heartbeat endpoint for DevTools
export async function GET() {
  return NextResponse.json({
    status: 'alive',
    message: 'Next.js development server heartbeat',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(Math.random() * 3600000), // Random uptime
    memory: {
      used: Math.floor(Math.random() * 100) + 50,
      total: 512
    },
    requests: Math.floor(Math.random() * 1000) + 100
  })
}