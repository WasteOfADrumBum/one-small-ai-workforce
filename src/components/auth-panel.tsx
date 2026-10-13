"use client";

import { Button, Field, Form, Input } from "@onesmall/ui";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";

interface AuthPanelProps {
  isAuthenticated: boolean;
  usernameHint: string;
  compact?: boolean;
}

export function AuthPanel({ isAuthenticated, usernameHint, compact = false }: AuthPanelProps) {
  const [username, setUsername] = useState(usernameHint);
  const [password, setPassword] = useState("");

  if (isAuthenticated) {
    return (
      <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
        Sign out
      </Button>
    );
  }

  if (compact) {
    return (
      <Button variant="outline" onClick={() => signIn(undefined, { callbackUrl: "/login" })}>
        Sign in
      </Button>
    );
  }

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        void signIn("credentials", { username, password, callbackUrl: "/" });
      }}
      style={{ display: "grid", gap: 10, maxWidth: 320 }}
    >
      <Field label="Username">
        <Input value={username} onChange={(event) => setUsername(event.currentTarget.value)} />
      </Field>
      <Field label="Password">
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
        />
      </Field>
      <Button type="submit">Sign in</Button>
    </Form>
  );
}
