import { Client } from '@notionhq/client'

export type Params = {
  notion: Client
  databaseId: string
  mood: string
  type: string
}
export const addMood = async ({ notion, databaseId, mood, type }: Params) => {
  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Mood: {
        title: [
          {
            text: {
              content: '',
            },
          },
        ],
      },
      name: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: mood,
            },
          },
        ],
      },
      type: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: type,
            },
          },
        ],
      },
    },
  })

  return 'success'
}
