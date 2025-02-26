import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getDistance } from 'geolib'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const categoryId = searchParams.get('categoryId')
    const maxDistance = parseFloat(searchParams.get('maxDistance') || '20')

    const businesses = await prisma.business.findMany({
      where: {
        categoryId: categoryId || undefined,
      },
      include: {
        category: true,
        reviews: true,
      },
    })

    // Mesafe hesaplama ve filtreleme
    const filteredBusinesses = businesses.filter((business) => {
      const distance = getDistance(
        { latitude: lat, longitude: lng },
        { latitude: business.latitude, longitude: business.longitude }
      )
      // Metre cinsinden mesafeyi kilometreye çevirme
      return distance / 1000 <= maxDistance
    })

    return NextResponse.json(filteredBusinesses)
  } catch (error) {
    return NextResponse.json(
      { error: 'İşletmeler getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 