import { Scenes } from 'telegraf'
import { Client } from '@notionhq/client'
// @ts-ignore
import Calendar from 'telegraf-calendar-telegram'

import { Row } from '../notionOperarions/getRowsData'
import { getRowsDbData } from '../notionOperarions/getRowsData'
import * as dotenv from 'dotenv'
import * as process from 'process'

dotenv.config()

const notion = new Client({ auth: process.env.NOTION_KEY })
const enterDataScene = new Scenes.BaseScene<Scenes.SceneContext>('data')
const todayDataScene = new Scenes.BaseScene<Scenes.SceneContext>('today')
const weekDataScene = new Scenes.BaseScene<Scenes.SceneContext>('week')
const periodFromDataScene = new Scenes.BaseScene<Scenes.SceneContext>('periodFrom')
const periodToDataScene = new Scenes.BaseScene<Scenes.SceneContext>('periodTo')
// const periodDataScene = new Scenes.BaseScene<Scenes.SceneContext>('periodFrom')

const splitTextIntoChunks = (text: string, chunkSize = 4096) => {
  const chunks = []
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize))
  }
  return chunks
}

const getDataFromNotion = async (rows: Row[], ctx: Scenes.SceneContext<Scenes.SceneSessionData>) => {
  let result = ``
  rows.forEach((row) => {
    const { date, mood, description } = row
    result += `${date} \n ${mood} \n ${description} \n\n`
  })

  if (result.length > 4096) {
    const chunks = splitTextIntoChunks(result) // Разбиваем текст на части

    for (const chunk of chunks) {
      await ctx.reply(chunk)
    }
  } else {
    await ctx.reply(result)
  }
}

const dateToISOFormat = (currentDate: Date) => currentDate.toISOString().split('T')[0]
const TODAY = dateToISOFormat(new Date())

export const dataScenes = [enterDataScene, todayDataScene, weekDataScene, periodFromDataScene, periodToDataScene]

enterDataScene.enter(async (ctx) => {
  const buttons = [
    [{ text: 'Выбрать период', callback_data: 'period' }],
    [{ text: 'Сегодня', callback_data: 'today' }],
    [{ text: 'За эту неделю', callback_data: 'week' }],
    [{ text: 'Назад', callback_data: 'back' }],
  ]
  await ctx.sendChatAction('typing')
  await ctx.reply('Какие записи?', {
    reply_markup: {
      inline_keyboard: buttons,
    },
  })
})

enterDataScene.action(/back/, async (ctx) => {
  await ctx.scene.leave()
  await ctx.reply('ок, еще раз')
})

enterDataScene.action(/today/, async (ctx) => {
  await ctx.scene.enter('today')
})

enterDataScene.action(/week/, async (ctx) => {
  await ctx.scene.enter('week')
})

enterDataScene.action(/period/, async (ctx) => {
  await ctx.scene.enter('periodFrom')
})

todayDataScene.enter(async (ctx) => {
  await ctx.reply('Так, что у нас сегодня')
  await ctx.sendChatAction('typing')
  await ctx.sendChatAction('typing')
  const rows = await getRowsDbData(notion, { from: TODAY, to: TODAY })
  if (rows.length === 0) {
    await ctx.reply('Нет ничего')
    return
  }
  await getDataFromNotion(rows, ctx)
  await ctx.scene.leave()
})

weekDataScene.enter(async (ctx) => {
  await ctx.reply('Так, что у нас на этой неделе')
  await ctx.sendChatAction('typing')
  const weekAgo = dateToISOFormat(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  const rows = await getRowsDbData(notion, { from: weekAgo, to: TODAY })
  if (rows.length === 0) {
    await ctx.reply('Нет ничего')
    return
  }
  await getDataFromNotion(rows, ctx)

  await ctx.scene.leave()
})

//@ts-ignore
export const calendarFrom = new Calendar(periodFromDataScene)
export const calendarTo = new Calendar(periodToDataScene)

const periodDate = {
  from: '',
  to: '',
}
//@ts-ignore
calendarFrom.setDateListener(async (ctx, date) => {
  if (!periodDate.from) {
    periodDate.from = date
    ctx.reply('А теперь до')
  } else {
    periodDate.to = date

    const { from, to } = periodDate
    periodDate.from = ''
    periodDate.to = ''
    await ctx.sendChatAction('typing')
    const rows = await getRowsDbData(notion, { from, to })
    if (rows.length === 0) {
      await ctx.reply('Нет ничего')
      return
    }
    await getDataFromNotion(rows, ctx)
    await ctx.scene.leave()
  }
  //   await ctx.scene.enter('periodTo')
})

periodFromDataScene.enter(async (ctx) => {
  await ctx.reply('введи от', calendarFrom.getCalendar())
})
