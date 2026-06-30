import type { GlobalRole } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      globalRole: GlobalRole;
    };
  }

  interface User {
    globalRole: GlobalRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    globalRole: GlobalRole;
  }
}
