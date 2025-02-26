import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadImage = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  const base64Data = buffer.toString('base64')
  const dataURI = `data:${file.type};base64,${base64Data}`
  
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'business-images',
  })
  
  return result.secure_url
}

export const deleteImage = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId)
} 