import { session, Telegraf } from 'telegraf'
import * as dotenv from 'dotenv'
import { rowScenes } from './scenes/rowScenes'
import { Stage } from 'telegraf/scenes'
import process from 'process'
import { moodScenes } from './scenes/moodScene'
import { aiScenes } from './scenes/analiseScene'

dotenv.config()

const bot = new Telegraf(process.env.TELEGRAM_TOKEN || '')

const newMoodStage = new Stage([...rowScenes, ...moodScenes, ...aiScenes])

bot.use(session())
// @ts-ignore
bot.use(newMoodStage.middleware())

bot.command('row', async (ctx) => {
  // @ts-ignore
  ctx.scene.enter('addMoodType')
})

bot.command('mood', async (ctx) => {
  // @ts-ignore
  ctx.scene.enter('moodName')
})

bot.command('back', async (ctx) => {
  // @ts-ignore
  ctx.scene.leave()
  ctx.reply('Ладно, давай еще раз')
})

bot.command('analise', async (ctx) => {
  // @ts-ignore
  ctx.scene.enter('roles')
})

bot.command('test', async (ctx) => {
  // @ts-ignore
  ctx.scene.enter('roles')
})

bot.on('text', async (ctx) => {
  await ctx.reply('ты не в сцене /row \n /mood \n /back \n /analise \n /test')
})

console.log('app running')
bot.launch()
