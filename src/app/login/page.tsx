import { Card, CardBody, CardHeader } from "@onesmall/ui";
import { env } from "@/lib/env";
import { AuthPanel } from "@/components/auth-panel";

export default function LoginPage() {
  return (
    <div className="osaw-stack" style={{ maxWidth: 420, margin: "0 auto" }}>
      <Card>
        <CardHeader>
          <h2>Operator sign in</h2>
        </CardHeader>
        <CardBody>
          <p>Use your demo credentials to run workflow simulations and approval actions.</p>
          <AuthPanel isAuthenticated={false} usernameHint={env.DEMO_AUTH_USERNAME} />
        </CardBody>
      </Card>
    </div>
  );
}
