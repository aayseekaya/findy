'use client'

import SwaggerUI from '@/app/components/SwaggerUI'

export default function ApiDocs() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">API Dokümantasyonu</h1>
        <SwaggerUI url="/api/docs" />
      </div>
    </main>
  )
} 