import { getMoodDbData } from '../notionOperarions/getMoodDbData'
import { Client } from '@notionhq/client'
import process from 'process'

const notion = new Client({ auth: process.env.NOTION_KEY })

export const getDataFromDb = async () => {
  const data = await getMoodDbData(notion)
  console.log(data)

  return JSON.stringify(data)
}
