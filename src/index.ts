import { session, Telegraf } from 'telegraf'
import * as dotenv from 'dotenv'
import { assessScene, describeScene, moodScene } from './scenes/AddScenes'
import { Stage } from 'telegraf/scenes'

dotenv.config()

const bot = new Telegraf(process.env.TELEGRAM_TOKEN || '')

const stage = new Stage([moodScene, describeScene, assessScene])

bot.use(session())
// @ts-ignore
bot.use(stage.middleware())

bot.command('start', async (ctx) => {
  // @ts-ignore
  ctx.scene.enter('mood')
})

bot.on('text', async (ctx) => {
  await ctx.reply('ты не в сцене')
})

console.log('app running')
bot.launch()

// const databaseId = process.env.NOTION_DATABASE_ID || ''
//
//
//

// bot.on('text', (ctx) => {
//   const userId = ctx.from.id
//   const session = userSession[userId]
//
//   if (!session) {
//     ctx.reply('Чтобы lj, введите команду /add')
//     return
//   }
//   session.comment = ctx.message.text
//   console.log(userSession)
//   ctx.reply('Данные успешно отправлены.')
//   delete userSession[userId]
// })
