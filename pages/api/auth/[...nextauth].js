import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default NextAuth({
  secret: process.env.SECRET,
  session: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  // debug: process.env.NODE_ENV !== 'production',
  debug: false,
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    signIn: async ({ account, user }) => {
      if (!user.email) {
        // https://developer.github.com/v3/users/emails/#list-email-addresses-for-the-authenticated-user
        const res = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `token ${account.access_token}`,
          },
        });
        const emails = await res.json();
        if (!emails || emails.length === 0) {
          return;
        }
        // Sort by primary email - the user may have several emails, but only one of them will be primary
        const sortedEmails = emails.sort((a, b) => b.primary - a.primary);
        user.email = sortedEmails[0].email;
      }

      const prismaUser = user;
      delete prismaUser.id;

      await prisma.user
        .upsert({
          where: { email: prismaUser.email },
          update: {},
          create: prismaUser,
        })
        .catch((err) => console.log({ err: err.message }));

      await prisma.$disconnect();

      return true;
    },
  },
});
