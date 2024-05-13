import OpenAi, { OpenAI } from 'openai'
import * as dotenv from 'dotenv'
import { getGptRoles } from './getGptRoles'
dotenv.config()

class Ai {
  private readonly openai: OpenAI
  constructor(apiKey: string) {
    this.openai = new OpenAi({
      apiKey,
    })
  }

  async analise(role: string, data: string) {
    const chatCompletion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: `${getGptRoles('base')} ${role} ${data}` }],
      model: 'gpt-3.5-turbo',
    })
    return chatCompletion.choices[0].message.content
  }
}

export const ai = new Ai(process.env.OPENAI_KEY || '')
