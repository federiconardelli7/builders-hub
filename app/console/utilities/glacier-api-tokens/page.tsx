import TokenManagement from "@/components/toolbox/console/utilities/glacier-api-tokens/TokenManagement";
import { getAuthSession } from "@/lib/auth/authSession";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

// TODO: replace with proper secret management
const JWT_SECRET = "DEVELOPMENT_SECRET_PLEASE_CHANGE_919341";

export default async function Page() {
  const session = await getAuthSession();

  // If not authenticated , redirect to login
  if (!session) {
    redirect("/login?callbackUrl=/console/utilities/glacier-api-tokens");
  }

  // Generate JWT for Glacier API
  const glacierJwt = jwt.sign(
    {
      sub: session.user.id,
      aud: "glacier-api",
      iss: "builder-hub",
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
