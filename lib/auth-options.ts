import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Auth options as a separate variable
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // In a real application, you'd verify credentials against your database
        // This is a simplified example
        if (
          credentials.email === "user@example.com" &&
          credentials.password === "password"
        ) {
          return {
            id: "1",
            name: "Test User",
            email: "user@example.com",
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
};
