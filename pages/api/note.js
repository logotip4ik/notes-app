import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
async function getUserNotes(req, res, user) {
  const notes = await prisma.note.findMany({
    where: { User: { email: user.email } },
  });

  res.json(notes);
}

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) return res.status(401).end();

  if (req.method === 'GET') return await getUserNotes(req, res, session.user);

  if (!res.writableFinished) res.status(400).end();
}
