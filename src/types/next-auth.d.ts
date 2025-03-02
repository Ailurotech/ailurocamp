import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    roles: string[];
    currentRole: string;
  }

  interface Session {
    user: {
      id: string;
      roles: string[];
      currentRole: string;
    } & DefaultSession['user'];
  }
}
