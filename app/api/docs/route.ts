import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import yaml from 'yaml'

export async function GET() {
  try {
    const swaggerFile = readFileSync(
      join(process.cwd(), 'swagger/swagger.yaml'),
      'utf8'
    )
    const swaggerDocument = yaml.parse(swaggerFile)
    
    return new NextResponse(JSON.stringify(swaggerDocument), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Swagger dosyası okunamadı:', error)
    return new NextResponse(
      JSON.stringify({ error: 'API dokümantasyonu yüklenemedi' }),
      { status: 500 }
    )
  }
} 