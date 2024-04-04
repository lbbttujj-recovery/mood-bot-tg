import { Client } from '@notionhq/client'

export type Params = {
  notion: Client
  pageId: string
}
export const createDb = async ({ notion, pageId }: Params) => {
  await notion.databases.create({
    parent: { page_id: pageId },
    properties: {
      Name: {
        type: 'title',
        title: {},
      },
    },
  })

  return 'success'
}
