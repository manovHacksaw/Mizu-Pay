import { ThirdwebAuth } from "@thirdweb-dev/auth/next";
import { Celo } from "@thirdweb-dev/chains";

export const { ThirdwebAuthHandler, getUser } = ThirdwebAuth({
  domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000",
  chain: Celo,
});

export { ThirdwebAuthHandler as GET, ThirdwebAuthHandler as POST };
