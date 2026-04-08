import { NextResponse } from 'next/server'

import unit1 from '../../content-files/Unit1.json'
import unit2 from '../../content-files/Unit2.json'
import unit3 from '../../content-files/Unit3.json'
import unit4 from '../../content-files/Unit4.json'
import unit5 from '../../content-files/Unit5.json'
import unit6 from '../../content-files/Unit6.json'
import unit7 from '../../content-files/Unit7.json'
import unit8 from '../../content-files/Unit8.json'
import unit9 from '../../content-files/Unit9.json'

export async function GET() {
  try {
    const units = Object.assign(
      {},
      unit1,
      unit2,
      unit3,
      unit4,
      unit5,
      unit6,
      unit7,
      unit8,
      unit9
    )

    return NextResponse.json(units)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Files not found' }, { status: 404 })
  }
}