import { db } from "@/lib/db/index"
import {
  privyClient,
  getUserAuth
} from "@/lib/auth"

export async function createTRPCContext(opts: { headers: Headers }) {
  const token = opts.headers.get('privy-token');

  let user = null;

  if (token) {
    try {
      user = await privyClient.verifyAuthToken(token);
    } catch (error) {
      console.error('Failed to verify token:', error);
    }
  }
  
  return {
    db,
    user,
    ...opts,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
