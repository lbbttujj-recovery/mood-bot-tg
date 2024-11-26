import { Scenes } from 'telegraf'
import * as dotenv from 'dotenv'
import { ai } from '../chatGpt/chatGptClass'
import { getDataFromDb } from '../utils/getDataFromDb'
import { getGptRoles } from '../chatGpt/getGptRoles'
dotenv.config()

const aiRolesScene = new Scenes.BaseScene<Scenes.SceneContext>('roles')
const aiCustomScene = new Scenes.BaseScene<Scenes.SceneContext>('custom')
const aiAnaliseScene = new Scenes.BaseScene<Scenes.SceneContext>('analise')

export const aiScenes = [aiCustomScene, aiRolesScene, aiAnaliseScene]
const rolesButtons = [
  [{ text: 'Полный анализ', callback_data: 'analise' }],
  [{ text: 'Свой вопрос', callback_data: 'custom' }],
  [{ text: 'Назад', callback_data: 'back' }],
]

aiRolesScene.enter(async (ctx) => {
  await ctx.sendChatAction('typing')
  await ctx.reply('Что сделать?', {
    reply_markup: {
      inline_keyboard: rolesButtons,
    },
  })
})

aiRolesScene.action(/.+/, (ctx) => {
  const currenRole = ctx.match[0]
  if (currenRole === 'custom') {
    ctx.scene.enter('custom')
  }
  if (currenRole === 'analise') {
    ctx.scene.enter('analise')
  }
  if (currenRole === 'back') {
    ctx.reply('Давай еще раз, хорошо')
    ctx.scene.leave()
  }
})

aiCustomScene.enter((ctx) => {
  ctx.reply('Задай вопрос')
})

aiCustomScene.on('text', async (ctx) => {
  const prompt = ctx.message.text
  await ctx.reply('Хорошо, начинаю анализ по выбранному запросу')
  console.log(prompt)
  await ctx.sendChatAction('typing')
  await getDataFromDb()
  // const analise = await ai.analise(prompt, await getDataFromDb())
  // await ctx.reply(analise || 'Ошибка')

  await ctx.reply('work done')
  await ctx.scene.leave()
})

aiAnaliseScene.enter(async (ctx) => {
  ctx.reply('Начинаю полный анализ')
  await ctx.sendChatAction('typing')
  const analise = await ai.analise(getGptRoles('analyst'), await getDataFromDb())
  await ctx.reply(analise || 'Ошибка')

  await ctx.scene.leave()
})
