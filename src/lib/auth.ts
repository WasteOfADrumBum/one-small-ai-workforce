import { env } from "@/lib/env";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Demo Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        if (
          credentials?.username === env.DEMO_AUTH_USERNAME &&
          credentials?.password === env.DEMO_AUTH_PASSWORD
        ) {
          return {
            id: "demo-user",
            name: "Demo Operator",
            email: "demo@onesmall.company",
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
};
