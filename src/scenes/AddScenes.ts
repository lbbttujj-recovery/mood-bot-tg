import { Scenes } from 'telegraf'
import { getMoodDict } from '../notionOperarions/getMoodDict'
import { Client } from '@notionhq/client'
import * as dotenv from 'dotenv'
import { createRow } from '../notionOperarions/createRow'
import * as process from 'process'
dotenv.config()

const notion = new Client({ auth: process.env.NOTION_KEY })
const userSession: Record<string, { mood?: string; comment?: string; assess?: number }> = {}
export const moodScene = new Scenes.BaseScene<Scenes.SceneContext>('mood')
moodScene.enter(async (ctx) => {
  getMoodDict(notion).then(async (moodDictionary) => {
    if (moodDictionary) {
      const buttons = moodDictionary.map((mood) => [
        {
          text: mood.name,
          callback_data: `id=${mood.id}`,
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

moodScene.action(/id=\S+/, async (ctx) => {
  await ctx.reply('Понятно')
  userSession[ctx.from.id] = { mood: ctx.match[0].slice(3) }
  await ctx.scene.enter('description')
})

export const describeScene = new Scenes.BaseScene<Scenes.SceneContext>('description')
describeScene.enter(async (ctx) => {
  await ctx.reply('Как так вышло?')
})

describeScene.on('text', async (ctx) => {
  const userId = ctx.from.id
  const session = userSession[userId]
  session.comment = ctx.message.text
  await ctx.reply('Понял')
  await createRow({
    notion,
    databaseId: process.env.NOTION_DATABASE_ID || '',
    moodId: session.mood || '',
    comment: session.comment || '',
    assessment: 0,
  })
  delete userSession[userId]
  await ctx.scene.leave()
  // await ctx.scene.enter('assess')
})

export const assessScene = new Scenes.BaseScene<Scenes.SceneContext>('assess')
assessScene.enter(async (ctx) => {
  await ctx.reply('в от 1 до 10 как')
})

assessScene.on('text', async (ctx) => {
  const userId = ctx.from.id
  const session = userSession[userId]
  session.assess = Number(ctx.message.text)
  await ctx.reply('Понял')
  await createRow({
    notion,
    databaseId: process.env.NOTION_DATABASE_ID || '',
    moodId: session.mood || '',
    comment: session.comment || '',
    assessment: session.assess,
  })
  delete userSession[userId]
  await ctx.scene.leave()
})
