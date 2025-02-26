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

    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
      select: {
        name: true,
        description: true,
        address: true,
        latitude: true,
        longitude: true,
        maxDistance: true,
        categoryId: true
      }
    })

    return NextResponse.json(business)
  } catch (error) {
    return NextResponse.json(
      { error: "Ayarlar getirilemedi" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "BUSINESS") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // Güncelleme verilerini doğrula
    if (data.maxDistance && (data.maxDistance < 1 || data.maxDistance > 100)) {
      return NextResponse.json(
        { error: "Maksimum mesafe 1-100 km arasında olmalıdır" },
        { status: 400 }
      )
    }

    const business = await prisma.business.update({
      where: { userId: session.user.id },
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        maxDistance: data.maxDistance,
        categoryId: data.categoryId
      }
    })

    return NextResponse.json(business)
  } catch (error) {
    return NextResponse.json(
      { error: "Ayarlar güncellenemedi" },
      { status: 500 }
    )
  }
} 