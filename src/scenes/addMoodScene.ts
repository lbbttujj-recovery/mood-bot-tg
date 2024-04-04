import { Scenes } from 'telegraf'
import { Client } from '@notionhq/client'
import * as dotenv from 'dotenv'
import * as process from 'process'
import { addMood } from '../notionOperarions/addMood'
dotenv.config()

const notion = new Client({ auth: process.env.NOTION_KEY })
const databaseId = process.env.NOTION_MOOD_DB_ID || ''
const newMood: { moodName?: string; type?: string } = {}

export const moodNameScene = new Scenes.BaseScene<Scenes.SceneContext>('moodName')
export const moodTypeScene = new Scenes.BaseScene<Scenes.SceneContext>('moodType')

export const moodType = ['физическое', 'социальное', 'экзистенциальное', 'эмоциональное']
const moodTypesButtons = moodType.map((mood) => [
  {
    text: mood,
    callback_data: `mood=${mood}`,
  },
])

moodNameScene.enter(async (ctx) => {
  await ctx.sendChatAction('typing')
  await ctx.reply('Что же ты чувствуешь')
})

moodNameScene.on('text', async (ctx) => {
  newMood.moodName = ctx.message.text
  await ctx.scene.enter('moodType')
})

moodTypeScene.enter(async (ctx) => {
  await ctx.sendChatAction('typing')
  await ctx.reply('Какой у нее тип?', {
    reply_markup: {
      inline_keyboard: moodTypesButtons,
    },
  })
})

moodTypeScene.action(/mood=\S+/, async (ctx) => {
  newMood.type = ctx.match[0].slice(5)
  const { moodName: mood, type } = newMood
  if (mood) {
    await addMood({ notion, databaseId, mood, type })
  }
  await ctx.reply('Записал')
  await ctx.scene.leave()
})
