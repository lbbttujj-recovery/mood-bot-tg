import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { Client } from '@notionhq/client'
import * as dotenv from 'dotenv'
import { before } from 'node:test'
dotenv.config()

type Period = {
  from: string
  to: string
}

export type Row = {
  mood: string
  date: string
  description: string
}

const formattedDate = (date: Date) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export const getRowsDbData = async (notion: Client, period: Period): Promise<Row[]> => {
  const moodDBId = process.env.NOTION_DATABASE_ID || ''
  const response = await notion.databases.query({
    database_id: moodDBId,
    sorts: [{ property: 'Date', direction: 'ascending' }],
    filter: {
      and: [
        {
          property: 'Date',
          date: {
            on_or_after: period.from,
          },
        },
        {
          property: 'Date',
          date: {
            on_or_before: period.to,
          },
        },
      ],
    },
  })
  const rows = response.results.map((el) => (el as DatabaseObjectResponse).properties)

  return rows.map((el) => ({
    // @ts-ignore
    mood: el.Mood.multi_select.map((el) => el.name).join(', ') as string,
    // @ts-ignore
    date: formattedDate(new Date(el.Date.date.start)),
    // @ts-ignore
    description: el.Description.rich_text[0].text.content as string,
  }))
}
