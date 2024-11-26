import * as fs from 'fs'
import * as path from 'path'

function writeBase64ToFile(base64Image: string) {
  const base64FilePath = path.join(__dirname, 'base64.txt')
  fs.writeFileSync(base64FilePath, base64Image)
  return base64FilePath
}

// Пример использования функции
export const imageToBase64 = (filePath: string) => {
  try {
    // Прочитайте файл изображения
    const imageData = fs.readFileSync(filePath)

    // Преобразуйте изображение в base64
    const base64Image = Buffer.from(imageData).toString('base64')
    writeBase64ToFile(base64Image)

    // Сохраните base64 в файл

    return 'success'
  } catch (error) {
    console.error('Error converting image to base64 and saving:', error)
    return null
  }
}
