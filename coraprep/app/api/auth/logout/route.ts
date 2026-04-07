import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // In this implementation, logout is handled on client side by clearing localStorage
  // This endpoint can be used for server-side cleanup in the future
  return NextResponse.json({ message: 'Logged out successfully' })
}
