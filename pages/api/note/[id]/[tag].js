import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
async function addOrUpdateTagOnNote(req, res, user) {
  if (isNaN(req.query.id)) return res.status(400).json({ msg: 'Not valid id' });
  const id = parseInt(req.query.id);
  const tagName = req.query.tag.slice(0, 50);

  const noteFromDb = await prisma.note.findUnique({
    where: { id },
    include: { User: true },
  });
  if (noteFromDb.User.email !== user.email) return res.status(400).end();

  const updatedNote = await prisma.note.update({
    where: { id },
    include: { tags: true },
    data: {
      tags: {
        connectOrCreate: {
          create: { name: tagName },
          where: { name: tagName },
        },
      },
    },
  });

  return res.status(200).json(updatedNote);
}

async function deleteTagOnNote(req, res, user) {
  if (isNaN(req.query.id)) return res.status(400).json({ msg: 'Not valid id' });
  const id = parseInt(req.query.id);
  const tagName = req.query.tag.slice(0, 50);

  const noteFromDb = await prisma.note.findUnique({
    where: { id },
    include: { User: true },
  });
  if (noteFromDb.User.email !== user.email) return res.status(400).end();

  const updatedNote = await prisma.note
    .update({
      where: { id },
      include: { tags: true },
      data: {
        tags: { disconnect: { name: tagName } },
      },
    })
    .catch((err) => {
      res.status(500).end();
      throw new Error(err.message);
    });

  return res.status(200).json(updatedNote);
}

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    await prisma.$disconnect();
    return res.status(401).end();
  }

  // prettier-ignore
  if (req.method === 'POST')
    return await addOrUpdateTagOnNote(req, res, session.user);
  if (req.method === 'DELETE')
    return await deleteTagOnNote(req, res, session.user);

  if (!res.writableEnded || !res.headersSent) res.status(400).end();
}
