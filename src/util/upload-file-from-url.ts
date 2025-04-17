import { Client } from 'minio'
import { v4 as uuidv4 } from 'uuid'

// Initialize MinIO client
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
})

export async function uploadFileFromUrl({
  fileUrl,
  uploadedFiles,
  provider,
}: {
  fileUrl?: string;
  uploadedFiles?: File[];
  provider?: string;
}) {
  try {
    const bucketName = process.env.MINIO_BUCKET || 'tore-space'
    
    // Ensure bucket exists
    const bucketExists = await minioClient.bucketExists(bucketName)
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName)
    }

    // Handle URL upload
    if (fileUrl) {
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`)
      }

      const buffer = await response.arrayBuffer()
      const fileName = `${uuidv4()}-${fileUrl.split('/').pop() || 'file'}`
      
      await minioClient.putObject(
        bucketName,
        fileName,
        Buffer.from(buffer),
        buffer.byteLength,
        {
          'Content-Type': response.headers.get('content-type') || 'application/octet-stream'
        }
      )

      return {
        fileUrls: [`${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${bucketName}/${fileName}`]
      }
    }

    // Handle direct file uploads
    if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
      const uploadPromises = uploadedFiles.map(async (file) => {
        const fileName = `${uuidv4()}-${file.name}`
        const buffer = await file.arrayBuffer()
        
        await minioClient.putObject(
          bucketName,
          fileName,
          Buffer.from(buffer),
          buffer.byteLength,
          {
            'Content-Type': file.type
          }
        )

        return `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${bucketName}/${fileName}`
      })

      const fileUrls = await Promise.all(uploadPromises)
      return { fileUrls }
    }

    throw new Error('No file to upload')
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

