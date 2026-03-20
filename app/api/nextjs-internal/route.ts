import { NextRequest, NextResponse } from 'next/server'

// Fake API endpoint that shows in DevTools Network tab
export async function GET(request: NextRequest) {
  // Return generic Next.js development response
  return NextResponse.json({
    message: 'Next.js internal API call',
    status: 'success',
    timestamp: new Date().toISOString(),
    environment: 'development',
    version: '14.0.0',
    build: 'development',
    cache: 'hit'
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'Next.js development response',
    status: 'ok',
    processed: true,
    timestamp: new Date().toISOString()
  })
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({
    message: 'Next.js internal update',
    status: 'updated',
    timestamp: new Date().toISOString()
  })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    message: 'Next.js cache cleared',
    status: 'cleared',
    timestamp: new Date().toISOString()
  })
}