import { PrismaClient } from "@prisma/client"
import { NextApiHandler } from "next"


const prisma = new PrismaClient()

const handler: NextApiHandler = async (req, res) => {
  res.statusCode = 200
  res.json({ name: 'John Doe' })
}
export default handler
