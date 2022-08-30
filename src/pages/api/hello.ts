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
  const explainResults = await prisma.$queryRawUnsafe(explain)
  if (!Array.isArray(explainResults)) {
    return []
  }
  return explainResults.map(row => {
    return {
      "id": row["f0"],
      "select_type": row["f1"],
      "table": row["f2"],
      "partitions": row["f3"],
      "type": row["f4"],
      "possible_keys": row["f5"],
      "key": row["f6"],
      "key_len": row["f7"],
      "ref": row["f8"],
      "rows": row["f9"],
      "filtered": row["f10"],
      "extra": row["f11"]
    }
  })
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
