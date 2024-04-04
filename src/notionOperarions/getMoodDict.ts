import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { Client } from '@notionhq/client'
import * as dotenv from 'dotenv'
dotenv.config()

export const getMoodDict = async (notion: Client) => {
  const moodDBId = process.env.NOTION_MOOD_DB_ID || ''

  const response = await notion.databases.query({
    database_id: moodDBId,
  })
  const rows = response.results.map((el) => (el as DatabaseObjectResponse).properties)
  return rows.map((el) => ({
    // @ts-ignore
    name: el.name.rich_text[0].text.content,
    // @ts-ignore
    type: el.type.rich_text[0].text.content,
  }))
}
