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

    // İşletme bilgilerini ve istatistikleri getir
    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            reviews: true,
            messages: true,
          }
        },
        reviews: {
          select: {
            rating: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        messages: {
          where: {
            isRead: false
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: "İşletme bulunamadı" },
        { status: 404 }
      )
    }

    // Ortalama puanı hesapla
    const avgRating = business.reviews.length > 0
      ? business.reviews.reduce((sum, review) => sum + review.rating, 0) / business.reviews.length
      : 0

    return NextResponse.json({
      ...business,
      avgRating
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Veriler getirilemedi" },
      { status: 500 }
    )
  }
} 