import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { businessId: string } }
) {
  try {
    const { businessId } = params

    // İşletme bilgilerini ve ilişkili verileri getir
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        images: {
          orderBy: {
            isMain: 'desc'
          }
        }
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı' },
        { status: 404 }
      )
    }

    // Değerlendirme istatistiklerini hesapla
    const stats = {
      avgRating: 0,
      totalReviews: business.reviews.length,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      }
    }

    if (business.reviews.length > 0) {
      // Ortalama puan
      const totalRating = business.reviews.reduce((sum, review) => sum + review.rating, 0)
      stats.avgRating = totalRating / business.reviews.length

      // Puan dağılımı
      business.reviews.forEach(review => {
        stats.ratingDistribution[review.rating]++
      })
    }

    // Ana fotoğrafı belirle
    const mainImage = business.images.find(img => img.isMain)?.url || business.images[0]?.url || null

    return NextResponse.json({
      business: {
        ...business,
        mainImage
      },
      stats
    })
  } catch (error) {
    console.error('İşletme detayları getirme hatası:', error)
    return NextResponse.json(
      { error: 'İşletme bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
} 