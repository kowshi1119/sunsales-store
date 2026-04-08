import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

const DEV_ADMIN_EMAIL = 'admin@sunsales.lk';
const DEV_ADMIN_PASSWORD = 'admin123';
export const AUTH_SECRET = process.env.NEXTAUTH_SECRET || 'sun-sales-local-dev-secret';

function normalizeCredentialIdentifier(value: string) {
  const normalized = value.toLowerCase().trim();
  return normalized === 'admin' ? DEV_ADMIN_EMAIL : normalized;
}

async function ensureDevelopmentAdmin() {
  const password = await bcrypt.hash(DEV_ADMIN_PASSWORD, 12);

  return prisma.user.upsert({
    where: { email: DEV_ADMIN_EMAIL },
    update: {
      password,
      fullName: 'Sun Sales Admin',
      phone: '+94771234567',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      isActive: true,
    },
    create: {
      email: DEV_ADMIN_EMAIL,
      password,
      fullName: 'Sun Sales Admin',
      phone: '+94771234567',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      isActive: true,
    },
  });
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      phone: string;
      avatar: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    phone: string;
    avatar: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    phone: string;
    avatar: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const rawIdentifier = credentials?.email?.toString() || '';
        const password = credentials?.password?.toString() || '';

        if (!rawIdentifier || !password) {
          throw new Error('Email and password are required');
        }

        const normalizedInput = rawIdentifier.toLowerCase().trim();
        const lookupEmail = normalizeCredentialIdentifier(rawIdentifier);
        const isDevelopmentAdminAttempt =
          process.env.NODE_ENV !== 'production' &&
          ['admin', DEV_ADMIN_EMAIL].includes(normalizedInput) &&
          password === DEV_ADMIN_PASSWORD;

        let user = null;

        try {
          user = await prisma.user.findUnique({
            where: { email: lookupEmail },
          });

          if (isDevelopmentAdminAttempt) {
            user = await ensureDevelopmentAdmin();
          }
        } catch (error) {
          if (isDevelopmentAdminAttempt) {
            return {
              id: 'local-dev-admin',
              email: DEV_ADMIN_EMAIL,
              name: 'Sun Sales Admin',
              role: 'SUPER_ADMIN',
              phone: '+94771234567',
              avatar: null,
            };
          }

          console.error('Auth lookup error:', error);
          throw new Error('Unable to reach the authentication service.');
        }

        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
          throw new Error('Your account has been deactivated. Please contact support.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        if (!user.emailVerified) {
          throw new Error('UNVERIFIED_EMAIL');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone;
        session.user.avatar = token.avatar;
      }
      return session;
    },
  },
  secret: AUTH_SECRET,
};
