import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      position?: string;
      department?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    position?: string;
    department?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    position?: string;
    department?: string;
  }
}
