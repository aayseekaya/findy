import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const withCount = searchParams.get('withCount') === 'true'

    const categories = await prisma.category.findMany({
      include: withCount ? {
        _count: {
          select: { businesses: true }
        }
      } : undefined,
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json(
      { error: "Kategoriler getirilemedi" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    const category = await prisma.category.create({
      data: { name }
    })

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json(
      { error: "Kategori oluşturulamadı" },
      { status: 500 }
    )
  }
} 