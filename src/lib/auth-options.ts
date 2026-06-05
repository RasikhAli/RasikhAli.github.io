import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      authorization: {
        params: {
          scope: "repo read:user",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      const authorizedUsers = (process.env.AUTHORIZED_GITHUB_USERS || "RasikhAli")
        .split(",")
        .map((u: string) => u.trim().toLowerCase());
      const username = profile?.login || user?.name || "";
      if (username && authorizedUsers.includes(username.toLowerCase())) {
        return true;
      }
      return false;
    },
    async jwt({ token, account, profile }: any) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.username = profile.login;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.user.username = token.username;
      return session;
    },
  },
  pages: {
    signIn: "/admin",
    error: "/admin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
