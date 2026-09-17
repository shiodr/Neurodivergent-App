import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

export async function saveUploadedFile(file: File): Promise<{ filename: string; publicUrl: string }> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })

  // Clean filename with timestamp to prevent collisions
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const uniqueName = `${Date.now()}_${cleanName}`
  const targetPath = path.join(uploadDir, uniqueName)

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  await writeFile(targetPath, buffer)

  return {
    filename: targetPath,
    publicUrl: `/uploads/${uniqueName}`,
  }
}
