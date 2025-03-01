import { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { UserRole } from '@/app/types/user';

interface CustomUser extends NextAuthUser {
  id: string;
  roles: UserRole[];
  currentRole: UserRole;
}

interface CustomSession extends Session {
  user: CustomUser;
}

interface CustomToken extends JWT {
  id: string;
  roles: UserRole[];
  currentRole: UserRole;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          await connectDB();

          const user = await User.findOne({ email: credentials?.email });
          if (!user) {
            throw new Error('No user found with this email');
          }

          const isValid = await user.comparePassword(
            credentials?.password || ''
          );
          if (!isValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            roles: user.roles,
            currentRole: user.currentRole,
          } as CustomUser;
        } catch (error: Error | unknown) {
          const message =
            error instanceof Error ? error.message : 'Authentication failed';
          throw new Error(message);
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register',
  },
  callbacks: {
    async jwt({ token, user }): Promise<CustomToken> {
      if (user) {
        token.id = (user as CustomUser).id;
        token.roles = (user as CustomUser).roles;
        token.currentRole = (user as CustomUser).currentRole;
      }
      return token as CustomToken;
    },
    async session({ session, token }): Promise<CustomSession> {
      if (session.user) {
        session.user.id = token.id;
        session.user.roles = (token as CustomToken).roles;
        session.user.currentRole = (token as CustomToken).currentRole;
      }
      return session as CustomSession;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
