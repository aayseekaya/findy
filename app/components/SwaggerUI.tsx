'use client'

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'
import SwaggerUIComponent from 'swagger-ui-react'

// Tip tanımlaması
interface SwaggerUIProps {
  url: string
}

// Dynamic import için tip tanımlaması
const SwaggerUIReact = dynamic<typeof SwaggerUIComponent>(
  () => import('swagger-ui-react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <div>Yükleniyor...</div>
  }
)

export default function SwaggerUI({ url }: SwaggerUIProps) {
  return (
    <div className="swagger-ui-container">
      <SwaggerUIReact url={url} />
      <style jsx global>{`
        .swagger-ui .info {
          margin: 20px 0;
        }
        .swagger-ui .scheme-container {
          margin: 0;
          padding: 20px 0;
        }
      `}</style>
    </div>
  )
} 