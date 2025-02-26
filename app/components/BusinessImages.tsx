"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import ImageUpload from './ImageUpload'

interface BusinessImage {
  id: string
  url: string
  isMain: boolean
}

interface BusinessImagesProps {
  businessId: string
}

export default function BusinessImages({ businessId }: BusinessImagesProps) {
  const [images, setImages] = useState<BusinessImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}/images`)
      if (!response.ok) throw new Error('Fotoğraflar yüklenemedi')
      const data = await response.json()
      setImages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [businessId])

  const handleUploadComplete = async () => {
    await fetchImages()
  }

  if (loading) return <div>Yükleniyor...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative aspect-video">
            <Image
              src={image.url}
              alt="İşletme fotoğrafı"
              fill
              className="object-cover rounded-lg"
            />
            {image.isMain && (
              <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs rounded">
                Ana Fotoğraf
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <ImageUpload
          businessId={businessId}
          onUploadComplete={handleUploadComplete}
          isMain={images.length === 0}
        />
        {images.length > 0 && (
          <ImageUpload
            businessId={businessId}
            onUploadComplete={handleUploadComplete}
            isMain={true}
          />
        )}
      </div>
    </div>
  )
} 