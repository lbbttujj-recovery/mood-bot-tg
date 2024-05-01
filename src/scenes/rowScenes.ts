import { Scenes } from 'telegraf'
import { getMoodDict } from '../notionOperarions/getMoodDict'
import { Client } from '@notionhq/client'
import * as dotenv from 'dotenv'
import { createRow } from '../notionOperarions/createRow'
import * as process from 'process'
import { moodType } from '../consts'
dotenv.config()

const notion = new Client({ auth: process.env.NOTION_KEY })
const newRow: { moodType?: string; mood?: string; comment?: string } = {}
export const moodScene = new Scenes.BaseScene<Scenes.SceneContext>('addMoodType')
export const addMoodNameScene = new Scenes.BaseScene<Scenes.SceneContext>('addMoodName')
export const describeScene = new Scenes.BaseScene<Scenes.SceneContext>('addDescription')

moodScene.enter(async (ctx) => {
  const buttons = [
    ...moodType.map((moodType) => [
      {
        text: moodType,
        callback_data: `id=${moodType}`,
      },
    ]),
    [{ text: 'Назад', callback_data: 'back' }],
  ]
  await ctx.sendChatAction('typing')
  await ctx.reply('что случилось?', {
    reply_markup: {
      inline_keyboard: buttons,
    },
  })
})

moodScene.action(/back/, async (ctx) => {
  await ctx.scene.leave()
  ctx.reply('Ладно, давай еще раз')
})

moodScene.action(/id=\W+/, async (ctx) => {
  newRow.moodType = ctx.match[0].slice(3)
  await ctx.scene.enter('addMoodName')
})

addMoodNameScene.enter(async (ctx) => {
  getMoodDict(notion).then(async (moodDictionary) => {
    if (moodDictionary) {
      const buttons = [
        ...moodDictionary
          .filter((mood) => mood.type === newRow.moodType)
          .map((mood) => [
            {
              text: mood.name,
              callback_data: `id=${mood.name}`,
            },
          ]),
        [{ text: 'Назад', callback_data: 'back' }],
      ]
      await ctx.sendChatAction('typing')
      await ctx.reply('что случилось?', {
        reply_markup: {
          inline_keyboard: buttons,
        },
      })
    }
  })
})

addMoodNameScene.action(/back/, async (ctx) => {
  await ctx.scene.enter('addMoodType')
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
