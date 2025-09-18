import TokenManagement from "@/components/toolbox/console/utilities/glacier-api-tokens/TokenManagement";
import { getAuthSession } from "@/lib/auth/authSession";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

// TODO: replace with proper secret management

export default async function Page() {
  const session = await getAuthSession();

  if (!process.env.DATA_API_JWT_SECRET) {
    throw new Error("DATA_API_JWT_SECRET is not set");
  }

  const JWT_SECRET = process.env.DATA_API_JWT_SECRET as string;
  // If not authenticated , redirect to login
  if (!session) {
    redirect("/login?callbackUrl=/console/utilities/glacier-api-tokens");
  }

  // Generate JWT for Glacier API
  const glacierJwt = jwt.sign(
    {
      sub: session.user.id,
      iss: "https://build.avax.network/",
      email: session.user.email,
    },
    JWT_SECRET,
    {
      expiresIn: '1h', // 60 minutes
      algorithm: 'HS256'
    }
  );

  // Pass authenticated user data to the component
  return (
    <TokenManagement
      glacierJwt={glacierJwt}
    />
  );
}
