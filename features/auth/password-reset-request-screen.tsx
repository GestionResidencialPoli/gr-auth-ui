"use client";

import { useState, type FormEvent } from "react";
import { AuthLayout, Button, Feedback, TextField } from "@gestionresidencial/shared-ui";
import { apiFetch } from "@gestionresidencial/auth-client";
import { content } from "@/config/content";

type Status = "idle" | "pending" | "sent" | "error";

export function PasswordResetRequestScreen() {
  const [status, setStatus] = useState<Status>("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "pending") return;
    setStatus("pending");

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).trim();

    try {
      await apiFetch("/api/v1/auth/password-reset", { method: "POST", body: { email } });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <AuthLayout brand={content.brand.name} mark={content.brand.mark} {...content.recover}>
      {status === "sent" ? (
        <Feedback>{content.recover.sent}</Feedback>
      ) : (
        <form className="gr-form" onSubmit={submit} aria-busy={status === "pending"}>
          <TextField
            id="email"
            name="email"
            label={content.recover.email}
            type="email"
            autoComplete="username"
            required
            maxLength={254}
            disabled={status === "pending"}
          />
          {status === "error" && <Feedback error>{content.auth.failed}</Feedback>}
          <Button type="submit" disabled={status === "pending"}>
            {status === "pending" ? content.recover.pending : content.recover.submit}
          </Button>
        </form>
      )}
      <p className="link-row">
        <a href="/login">{content.recover.backToLogin}</a>
      </p>
    </AuthLayout>
  );
}
