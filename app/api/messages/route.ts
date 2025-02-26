import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"
import { authOptions } from "../auth/[...nextauth]/route"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 })
    }

    const { content, businessId } = await request.json()

    const message = await prisma.message.create({
      data: {
        content,
        userId: session.user.id,
        businessId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // WebSocket ile mesajı yayınla
    await pusherServer.trigger(`chat-${businessId}`, 'new-message', message)

    return NextResponse.json(message)
  } catch (error) {
    return NextResponse.json(
      { error: "Mesaj gönderilemedi" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    
    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID gerekli" },
        { status: 400 }
      )
    }

    const messages = await prisma.message.findMany({
      where: {
        businessId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json(
      { error: "Mesajlar getirilemedi" },
      { status: 500 }
    )
  }
} 