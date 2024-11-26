import { session, Telegraf } from 'telegraf'
import * as dotenv from 'dotenv'
import { rowScenes } from './scenes/rowScenes'
import { Stage } from 'telegraf/scenes'
import process from 'process'
import { moodScenes } from './scenes/moodScene'
import { aiScenes } from './scenes/analiseScene'
import * as fs from 'fs'
import { imageToBase64 } from './utils/imageToBase64'
import path from 'node:path'
import axios from 'axios'

dotenv.config()

const bot = new Telegraf(process.env.TELEGRAM_TOKEN || '')

const newMoodStage = new Stage([...rowScenes, ...moodScenes, ...aiScenes])

bot.use(session())
// @ts-ignore
bot.use(newMoodStage.middleware())

bot.on('callback_query', (ctx) => {
  const { data } = ctx.callbackQuery as { data: string }
  switch (data) {
    case 'row':
      // @ts-ignore
      ctx.scene.enter('addMoodType')
      break
    case 'mood':
      // @ts-ignore
      ctx.scene.enter('moodName')
      break
    case 'analise':
      // @ts-ignore
      ctx.scene.enter('roles')
      break
    case 'back':
      // @ts-ignore
      ctx.scene.leave()
      ctx.reply('Ладно, давай еще раз')
      break
    default:
      ctx.reply('Хмм, что-то не так')
      break
  }
})

// bot.command('test', async (ctx) => {
bot.on('photo', async (ctx) => {
  try {
    const photo = ctx.message.photo[0]
    const photoInfo = await ctx.telegram.getFile(photo.file_id)

    if (photoInfo.file_path) {
      const { href: imagePath } = await ctx.telegram.getFileLink(photoInfo.file_id)
      const currentPath = path.resolve(__dirname, './buffer', `${photoInfo.file_unique_id}.jpg`)
      const response = await axios({
        method: 'get',
        url: imagePath,
        responseType: 'stream',
      })
      return new Promise((resolve) => {
        const stream = fs.createWriteStream(currentPath)
        response.data.pipe(stream)
        stream.on('finish', async () => {
          resolve('')
          await ctx.reply('загрузил')
          imageToBase64(currentPath)
        })
      })

      // Преобразуйте изображение в base64 и сохраните его в файл

      // Удалите фотографию после сохранения base64
      // fs.unlinkSync(path)
    }

    // Отправьте сообщение об успешном сохранении и пути к файлу base64
    ctx.reply(`Фото удалено и base64 сохранен в файле base64.txt`)
  } catch (error) {
    console.error('Error handling photo:', error)
    ctx.reply('Произошла ошибка при обработке фото')
  }
})
// })

bot.on('text', async (ctx) => {
  // await ctx.reply('ты не в сцене /row \n /mood \n /back \n /analise \n /test')
  await ctx.reply('Я тут, что сделать?', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Запись', callback_data: 'row' }],
        [{ text: 'Добавить настроение', callback_data: 'mood' }],
        [{ text: 'Анализ', callback_data: 'analise' }],
        [{ text: 'Назад', callback_data: 'back' }],
      ],
    },
  })
})

console.log('app running')
bot.launch()
