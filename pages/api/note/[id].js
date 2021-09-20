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
 *
 * @param {Object | Array} obj
 * @returns {Object} clean, sanitized object
 */
const sanitize = (obj) =>
  Array.isArray(obj)
    ? obj.reduce(
        (acc, key) => [
          ...acc,
          typeof obj[key] === 'object'
            ? sanitize(obj[key])
            : dompurify.sanitize(obj[key]),
        ],
        [],
      )
    : Object.keys(obj).reduce(
        (acc, key) => ({
          ...acc,
          [key]:
            typeof obj[key] === 'object'
              ? sanitize(obj[key])
              : dompurify.sanitize(obj[key]),
        }),
        {},
      );

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
async function updateUserNote(req, res, user) {
  if (isNaN(req.query.id)) return res.status(400).end();
  const id = parseInt(req.query.id);

  const validNote = await updateSchema.validate(req.body).catch((err) => {
    res.status(400).send(err.message);
    throw Error('Not valid note content');
  });
  const secureNote = sanitize(validNote);
  const noteFromDB = await prisma.note.findUnique({
    where: { id },
    include: { User: true },
  });
  if (noteFromDB.User.email !== user.email) return res.status(400).end();

  const updatedNote = await prisma.note.update({
    where: { id },
    data: { title: secureNote.title, content: secureNote.content },
  });

  res.status(200).json(updatedNote);

  // res.json(createdNote);
  await prisma.$disconnect();
}

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
async function deleteUserNote(req, res, user) {
  if (isNaN(req.query.id)) return res.status(400).end();
  const id = parseInt(req.query.id);

  const noteFromDB = await prisma.note.findUnique({
    where: { id },
    include: { User: true },
  });
  if (noteFromDB.User.email !== user.email) return res.status(400).end();

  await prisma.note.delete({
    where: { id },
  });

  res.status(200).end();

  // res.json(createdNote);
  await prisma.$disconnect();
}

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    await prisma.$disconnect();
    res.status(401).end();
    return;
  }

  // prettier-ignore
  if (req.method === 'POST')
    return await updateUserNote(req, res, session.user);
  if (req.method === 'DELETE')
    return await deleteUserNote(req, res, session.user);

  if (!res.writableEnded || !res.headersSent) res.status(400).end();
}
