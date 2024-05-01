import { Client } from '@notionhq/client'

export type Params = {
  notion: Client
  databaseId: string
  mood: string
  comment: string
}
export const createRow = async ({ notion, databaseId, mood, comment }: Params) => {
  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: 'Дневник настроения',
            },
          },
        ],
      },
      Mood: {
        multi_select: [{ name: mood }],
      },
      Description: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: comment,
            },
          },
        ],
      },
      Date: {
        date: {
          start: new Date().toISOString(),
        },
      },
    },
  })

  return 'success'
}
