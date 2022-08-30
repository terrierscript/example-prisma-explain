import { Prisma, PrismaClient } from "@prisma/client"
import { NextApiHandler } from "next"
import * as SqlString from "sqlstring"

import * as csvParse from "csv-parse"
import * as Papa from "papaparse"

const parseParam = (param: string) => {
  const removeBlacket = param
    .replace(/^\[/, "")
    .replace(/\]$/, "")
  const parsed = Papa.parse(removeBlacket, {
    dynamicTyping: true
  })
  return parsed.data[0]
}

const explainQuery = async (prisma: PrismaClient, event: Prisma.QueryEvent) => {
  if (!event.query.startsWith("SELECT")) {
    return
  }
  const params = parseParam(event.params)

  if (!Array.isArray(params)) {
    return
  }
  const rawQuery = SqlString.format(event.query, params)

  const explain = `EXPLAIN ${rawQuery}`
  const explainResult = await prisma.$queryRawUnsafe(explain)
  return explainResult
}

const handler: NextApiHandler = async (req, res) => {
  res.statusCode = 200
  const prisma = new PrismaClient({
    log: [{ level: "query", emit: "event" }]
  })
  prisma.$on("query", async (event) => {
    const result = await explainQuery(prisma, event)
    console.log(result)
  })
  // prisma.$use(async (params, next) => {
  //   console.log("middleware", params)
  //   return next(params)
  // })

  const data = await prisma.post.findFirst({
    where: {
      title: "xx,x",
      published: true,
      createdAt: {
        gt: new Date().toISOString()
      }
    }
  })
  res.json({ name: 'John Doe', data })
  await prisma.$disconnect()
}
export default handler
