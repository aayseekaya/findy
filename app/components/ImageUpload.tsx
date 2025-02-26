import { useState } from "react"

interface ImageUploadProps {
  businessId: string
  onUploadComplete?: (imageUrl: string) => Promise<void> | void
  isMain?: boolean
}

export default function ImageUpload({ businessId, onUploadComplete, isMain = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Lütfen bir resim dosyası seçin')
      return
    }

    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('image', file)
      formData.append('isMain', isMain.toString())

      const response = await fetch(`/api/businesses/${businessId}/images`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Resim yüklenemedi')
      }

      const data = await response.json()
      
      if (onUploadComplete) {
        await onUploadComplete(data.url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
        id={`image-upload-${businessId}`}
      />
      <label
        htmlFor={`image-upload-${businessId}`}
        className={`
          inline-block px-4 py-2 rounded-md
          ${uploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
          }
          text-white font-medium text-sm
        `}
      >
        {uploading ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
      </label>
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
} 