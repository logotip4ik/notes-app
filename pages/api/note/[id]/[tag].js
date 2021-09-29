import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import createDomPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import * as yup from 'yup';

const prisma = new PrismaClient();
const window = new JSDOM('').window;
const dompurify = createDomPurify(window);
const updateSchema = yup.object().shape({
  id: yup.number().required(),
  title: yup.string().max(200).defined(),
  content: yup.string().defined(),
  tags: yup.array().optional(),
  createdAt: yup.string().required(),
  updatedAt: yup.string().default(new Date().toISOString()).required(),
});

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
async function addOrUpdateTagOnNote(req, res, user) {
  if (isNaN(req.query.id)) return res.status(400).json({ msg: 'Not valid id' });
  const id = parseInt(req.query.id);

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
          create: { name: req.query.tag },
          where: { name: req.query.tag },
        },
      },
    },
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
