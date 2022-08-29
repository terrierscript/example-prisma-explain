import { Prisma, PrismaClient } from "@prisma/client"
import { NextApiHandler } from "next"



const handler: NextApiHandler = async (req, res) => {
  res.statusCode = 200
  const prisma = new PrismaClient({
    log: [{ level: "query", emit: "event" }]
  })
  prisma.$on("query", async (event) => {
    console.log(event)
    if (!event.query.startsWith("SELECT")) {
      return
    }
    const params = JSON.parse(event.params)
    if (!Array.isArray(params)) {
      return
    }
    const replaced = params.reduce((query, param, idx) => {
      const replaced = typeof param === "number" ? param : `"${param}"`
      return query.replace("?", replaced)
    }, event.query)

    const explain = `EXPLAIN ${replaced}`
    const explainResult = await prisma.$queryRawUnsafe(explain)
    console.log({ explain, explainResult })
  })

  const data = await prisma.post.findFirst({
    where: {
      title: "xxx"
    }
  })
  res.json({ name: 'John Doe', data })
  await prisma.$disconnect()
}
export default handler
