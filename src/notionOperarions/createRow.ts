import { Client } from '@notionhq/client'

export type Params = {
  notion: Client
  databaseId: string
  moodId: string
  comment: string
  assessment: number
}
export const createRow = async ({ notion, databaseId, moodId, comment, assessment }: Params) => {
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
        multi_select: [{ id: moodId }],
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
      // Assessment: {
      //   rich_text: [
      //     {
      //       type: 'text',
      //       text: {
      //         content: assessment + '',
      //       },
      //     },
      //   ],
      // },
    },
  })

  return 'success'
}
