"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-gray-600 hover:text-gray-900"
    >
      Uitloggen
    </button>
  );
}
