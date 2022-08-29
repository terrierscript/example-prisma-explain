import { PrismaClient } from "@prisma/client"
import { NextApiHandler } from "next"


const prisma = new PrismaClient()

const handler: NextApiHandler = async (req, res) => {
  res.statusCode = 200
  const data = await prisma.post.findFirst({
    where: {
      title: "xxx"
    }
  })
  res.json({ name: 'John Doe', data })
}
export default handler
