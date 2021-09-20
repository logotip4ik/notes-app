import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import createDomPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import * as yup from 'yup';

const prisma = new PrismaClient();
const window = new JSDOM('').window;
const dompurify = createDomPurify(window);
const createSchema = yup.object().shape({
  title: yup.string().max(200).defined(),
  content: yup.string().defined(),
  tags: yup.array().optional(),
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
async function getUserNotes(req, res, user) {
  const notes = await prisma.note.findMany({
    where: { User: { email: user.email } },
    include: { tags: true },
  });

  res.json(notes);
  await prisma.$disconnect();
}

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
async function createUserNote(req, res, user) {
  const validNote = await createSchema.validate(req.body).catch((err) => {
    res.status(400).send(err.message);
    throw Error('Not valid note content');
  });
  const secureNote = sanitize(validNote);
  const createdNote = await prisma.note.create({
    data: { User: { connect: { email: user.email } }, ...secureNote },
    include: { tags: true },
  });

  res.json(createdNote);
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
  if (req.method === 'GET')
    return await getUserNotes(req, res, session.user);
  if (req.method === 'POST')
    return await createUserNote(req, res, session.user);

  if (!res.writableEnded || !res.headersSent) res.status(400).end();
}
