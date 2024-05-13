import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { Client } from '@notionhq/client'
import * as dotenv from 'dotenv'
dotenv.config()

export const getMoodDbData = async (notion: Client) => {
  const moodDBId = process.env.NOTION_DATABASE_ID || ''

  const response = await notion.databases.query({
    database_id: moodDBId,
    sorts: [{ property: 'Date', direction: 'ascending' }],
  })
  const rows = response.results.map((el) => (el as DatabaseObjectResponse).properties)

  return rows.map((el) => ({
    // @ts-ignore
    mood: el.Mood.multi_select.map((el) => el.name).join(', '),
    // @ts-ignore
    date: el.Date.date.start,
    // @ts-ignore
    description: el.Description.rich_text[0].text.content,
  }))
}
