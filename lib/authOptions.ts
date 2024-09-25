import { AuthOptions, User as AuthUser } from "next-auth";
import { Account } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

import bcrypt from "bcryptjs";
import prisma from "@/utils/db";
import { nanoid } from "nanoid";

export const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Ensure both email and password are provided
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Fetch the user from the database using Prisma
          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            return null; // No user found
          }

          // Compare passwords
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password!
          );

          if (!isPasswordCorrect) {
            return null; // Invalid password
          }

          // Return the user object with fields expected by NextAuth
          return {
            id: user.id,
            email: user.email,
            name: user.email, // NextAuth expects a "name" field
          };
        } catch (err: any) {
          console.error("Error during authentication", err);
          throw new Error("Failed to authenticate");
        }
      },
    }),
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID ?? "",
    //   clientSecret: process.env.GITHUB_SECRET ?? "",
    // }),
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_ID ?? "",
    //   clientSecret: process.env.GOOGLE_SECRET ?? "",
    // }),
    // ...add more providers here if you want. You can find them on nextauth website.
  ],
  callbacks: {
    async signIn({ user, account }: { user: AuthUser; account: Account | null }) {
      if (account?.provider === "credentials") {
        return true;
      }
  

      // if (account?.provider == "github") {
      //   try {
      //     const existingUser = await prisma.user.findFirst({ where: { email: user.email! } });
      //     if (!existingUser) {
      //       await prisma.user.create({
      //         data: {
      //           id: nanoid() + "",
      //           email: user.email!
      //         },
      //       });
      //       return true;
      //     }
      //     return true;
      //   } catch (err) {
      //     console.log("Error saving user", err);
      //     return false;
      //   }
      // }

      // if (account?.provider == "google") {
      //   try {
      //     const existingUser = await prisma.user.findFirst({ where: { email: user.email! } });
      //     if (!existingUser) {
      //       await prisma.user.create({
      //         data: {
      //           id: nanoid() + "",
      //           email: user.email!
      //         },
      //       });
      //       return true;
      //     }
      //     return true;
      //   } catch (err) {
      //     console.log("Error saving user", err);
      //     return false;
      //   }
      // }

      return false; // Default return statement
    },
  },
};

