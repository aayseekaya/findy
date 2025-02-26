import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getDistance } from "geolib"
import { Prisma } from "@prisma/client"

// Business tipi tanımı
type BusinessWithRelations = Prisma.BusinessGetPayload<{
  include: {
    category: true
    reviews: {
      select: {
        rating: true
        createdAt: true
      }
    }
    images: {
      where: { isMain: true }
      select: {
        url: true
      }
    }
  }
}>

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Temel parametreler
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const maxDistance = parseFloat(searchParams.get('maxDistance') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Filtreleme parametreleri
    const categoryId = searchParams.get('categoryId')
    const query = searchParams.get('query')
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const sortBy = searchParams.get('sortBy') || 'distance'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Temel sorgu oluşturma
    const baseQuery = {
      where: {
        AND: [
          categoryId ? { categoryId } : {},
          query ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          } : {},
        ]
      },
      include: {
        category: true,
        reviews: {
          select: {
            rating: true,
            createdAt: true
          }
        },
        images: {
          where: { isMain: true },
          select: {
            url: true
          },
          take: 1
        }
      },
      skip: (page - 1) * limit,
      take: limit,
    } satisfies Prisma.BusinessFindManyArgs

    // Verileri çek
    const [businesses, total] = await prisma.$transaction([
      prisma.business.findMany(baseQuery),
      prisma.business.count({ where: baseQuery.where })
    ])

    // Mesafe hesaplama ve ortalama puan ekleme
    const processedBusinesses = (businesses as BusinessWithRelations[]).map(business => {
      const distance = getDistance(
        { latitude: lat, longitude: lng },
        { latitude: business.latitude, longitude: business.longitude }
      ) / 1000

      const avgRating = business.reviews.length > 0
        ? business.reviews.reduce((sum, review) => sum + review.rating, 0) / business.reviews.length
        : 0

      return {
        ...business,
        distance,
        avgRating,
        mainImage: business.images[0]?.url || null,
        reviews: undefined
      }
    })

    // Mesafe filtresi uygula
    const filteredBusinesses = processedBusinesses.filter(
      business => business.distance <= maxDistance
    )

    // Minimum puana göre filtrele
    const ratedBusinesses = filteredBusinesses.filter(
      business => business.avgRating >= minRating
    )

    // Sıralama
    const sortedBusinesses = ratedBusinesses.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return sortOrder === 'asc' ? a.distance - b.distance : b.distance - a.distance
        case 'rating':
          return sortOrder === 'asc' ? a.avgRating - b.avgRating : b.avgRating - a.avgRating
        case 'name':
          return sortOrder === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        default:
          return 0
      }
    })

    return NextResponse.json({
      businesses: sortedBusinesses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'İşletmeler aranırken bir hata oluştu' },
      { status: 500 }
    )
  }
} 