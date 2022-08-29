import { Prisma, PrismaClient } from "@prisma/client"
import { NextApiHandler } from "next"



const handler: NextApiHandler = async (req, res) => {
  res.statusCode = 200
  const prisma = new PrismaClient({
    log: [{ level: "query", emit: "event" }]
  })
  // prisma.$on("query", async (event) => {
  //   console.log(event)
  //   if (event.query.startsWith("SELECT")) {
  //     const explain = `EXPLAIN ${event.query}`
  //     const params = JSON.parse(event.params)
  //     const result = await prisma.$queryRawUnsafe(explain, ...params)
  //     console.log(result)
  //     // const rr = await prisma.$queryRaw()
  //     // console.log(rr)
  //   }
  // })
  prisma.$use(async (params, next) => {
    const result = await next(params)
    console.log({ result, params })
    return result
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
