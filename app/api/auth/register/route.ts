import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, role, businessInfo } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Gerekli alanları doldurun" },
        { status: 400 }
      )
    }

    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanımda" },
        { status: 400 }
      )
    }

    // Şifre hashleme
    const hashedPassword = await bcrypt.hash(password, 10)

    // Kullanıcı oluşturma
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as Role
      }
    })

    // İşletme rolü seçildiyse işletme oluştur
    let business = null
    if (role === Role.BUSINESS && businessInfo) {
      business = await prisma.business.create({
        data: {
          ...businessInfo,
          userId: user.id
        }
      })
    }

    // Hassas bilgileri çıkar
    const { password: _, ...safeUser } = user

    return NextResponse.json(
      {
        user: safeUser,
        ...(business && { business })
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Kayıt hatası:", error)
    return NextResponse.json(
      { error: "Kayıt işlemi sırasında bir hata oluştu" },
      { status: 500 }
    )
  }
} 