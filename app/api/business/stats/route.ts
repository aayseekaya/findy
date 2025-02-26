import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "BUSINESS") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week' // week, month, year
    
    const business = await prisma.business.findUnique({
      where: { userId: session.user.id }
    })

    if (!business) {
      return NextResponse.json(
        { error: "İşletme bulunamadı" },
        { status: 404 }
      )
    }

    // Tarih aralığını belirle
    const now = new Date()
    let startDate = new Date()
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // İstatistikleri getir
    const [reviews, messages] = await Promise.all([
      prisma.review.findMany({
        where: {
          businessId: business.id,
          createdAt: {
            gte: startDate
          }
        },
        select: {
          rating: true,
          createdAt: true
        }
      }),
      prisma.message.findMany({
        where: {
          businessId: business.id,
          createdAt: {
            gte: startDate
          }
        },
        select: {
          createdAt: true,
          isRead: true
        }
      })
    ])

    // İstatistikleri hesapla
    const stats = {
      totalReviews: reviews.length,
      avgRating: reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0,
      totalMessages: messages.length,
      unreadMessages: messages.filter(m => !m.isRead).length,
      ratingDistribution: {
        1: reviews.filter(r => r.rating === 1).length,
        2: reviews.filter(r => r.rating === 2).length,
        3: reviews.filter(r => r.rating === 3).length,
        4: reviews.filter(r => r.rating === 4).length,
        5: reviews.filter(r => r.rating === 5).length,
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json(
      { error: "İstatistikler getirilemedi" },
      { status: 500 }
    )
  }
} 