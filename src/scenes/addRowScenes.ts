import { Scenes } from 'telegraf'
import { getMoodDict } from '../notionOperarions/getMoodDict'
import { Client } from '@notionhq/client'
import * as dotenv from 'dotenv'
import { createRow } from '../notionOperarions/createRow'
import * as process from 'process'
import { moodType } from './addMoodScene'
dotenv.config()

const notion = new Client({ auth: process.env.NOTION_KEY })
const newRow: { moodType?: string; mood?: string; comment?: string } = {}
export const moodScene = new Scenes.BaseScene<Scenes.SceneContext>('addMoodType')
export const addMoodNameScene = new Scenes.BaseScene<Scenes.SceneContext>('addMoodName')
export const describeScene = new Scenes.BaseScene<Scenes.SceneContext>('addDescription')

moodScene.enter(async (ctx) => {
  const buttons = moodType.map((moodType) => [
    {
      text: moodType,
      callback_data: `id=${moodType}`,
    },
  ])
  await ctx.sendChatAction('typing')
  await ctx.reply('что случилось?', {
    reply_markup: {
      inline_keyboard: buttons,
    },
  })
})

moodScene.action(/id=\W+/, async (ctx) => {
  newRow.moodType = ctx.match[0].slice(3)
  await ctx.scene.enter('addMoodName')
})

addMoodNameScene.enter(async (ctx) => {
  getMoodDict(notion).then(async (moodDictionary) => {
    if (moodDictionary) {
      console.log(moodDictionary.filter((mood) => mood.type === newRow.moodType))
      const buttons = moodDictionary
        .filter((mood) => mood.type === newRow.moodType)
        .map((mood) => [
          {
            text: mood.name,
            callback_data: `id=${mood.name}`,
          },
        ])
      await ctx.sendChatAction('typing')
      await ctx.reply('что случилось?', {
        reply_markup: {
          inline_keyboard: buttons,
        },
      })
    }
  })
})

addMoodNameScene.action(/id=\W+/, async (ctx) => {
  await ctx.reply('Понятно')
  newRow.mood = ctx.match[0].slice(3)
  await ctx.scene.enter('addDescription')
})

describeScene.enter(async (ctx) => {
  await ctx.reply('Как так вышло?')
})

describeScene.on('text', async (ctx) => {
  newRow.comment = ctx.message.text
  await ctx.reply('Понял')
  await createRow({
    notion,
    databaseId: process.env.NOTION_DATABASE_ID || '',
    mood: newRow.mood || '',
    comment: newRow.comment || '',
  })
  await ctx.scene.leave()
})
