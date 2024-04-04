import { session, Telegraf } from 'telegraf'
import * as dotenv from 'dotenv'
import { addMoodNameScene, describeScene, moodScene } from './scenes/addRowScenes'
import { Stage } from 'telegraf/scenes'
import process from 'process'
import { moodNameScene, moodTypeScene } from './scenes/addMoodScene'

dotenv.config()

const bot = new Telegraf(process.env.TELEGRAM_TOKEN || '')

//todo: Поменять moodNameScene название
const newMoodStage = new Stage([moodScene, addMoodNameScene, describeScene, moodNameScene, moodTypeScene])

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

bot.on('text', async (ctx) => {
  await ctx.reply('ты не в сцене /row \n /mood')
})

console.log('app running')
bot.launch()
