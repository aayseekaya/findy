import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { uploadImage } from "@/lib/cloudinary"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Yetkilendirme gerekli" },
        { status: 401 }
      )
    }

    // İşletme sahibi kontrolü
    const business = await prisma.business.findUnique({
      where: { id: params.id },
      select: { userId: true }
    })

    if (!business || business.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu işlemi yapmaya yetkiniz yok" },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    const isMain = formData.get('isMain') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: "Dosya gerekli" },
        { status: 400 }
      )
    }

    // Dosya türü kontrolü
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "Sadece resim dosyaları yüklenebilir" },
        { status: 400 }
      )
    }

    const imageUrl = await uploadImage(file)

    // Eğer ana fotoğraf olarak işaretlendiyse, diğer fotoğrafları güncelle
    if (isMain) {
      await prisma.businessImage.updateMany({
        where: { businessId: params.id },
        data: { isMain: false }
      })
    }

    const image = await prisma.businessImage.create({
      data: {
        url: imageUrl,
        businessId: params.id,
        isMain
      }
    })

    return NextResponse.json(image)
  } catch (error) {
    return NextResponse.json(
      { error: "Fotoğraf yüklenemedi" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const images = await prisma.businessImage.findMany({
      where: { businessId: params.id },
      orderBy: [
        { isMain: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(images)
  } catch (error) {
    return NextResponse.json(
      { error: "Fotoğraflar getirilemedi" },
      { status: 500 }
    )
  }
} 