"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AuthLayout,
  Button,
  EmptyState,
  Feedback,
  PasswordField,
} from "@gestionresidencial/shared-ui";
import { ApiClientError, apiFetch } from "@gestionresidencial/auth-client";
import { content } from "@/config/content";

type Status = "idle" | "pending" | "done" | "no-token" | "error";

/**
 * El backend responde 400 tanto para un token invalido/expirado como para una
 * contrasena que no cumple la politica -- no hay forma de distinguirlos por
 * el codigo de estado. Se muestra el mensaje que el backend ya redacta en
 * espanol para el usuario en vez de adivinar cual de los dos ocurrio.
 */
export function PasswordResetConfirmScreen() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>();
  const token = useRef<string | null>(null);

  useEffect(() => {
    token.current = new URLSearchParams(window.location.search).get("token")?.trim() || null;
    if (!token.current) setStatus("no-token");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "pending" || !token.current) return;
    setStatus("pending");
    setError(undefined);

    const data = new FormData(event.currentTarget);
    const newPassword = String(data.get("newPassword"));

    try {
      await apiFetch("/api/v1/auth/password-reset/confirm", {
        method: "POST",
        body: { token: token.current, newPassword },
      });
      setStatus("done");
    } catch (caughtError) {
      setStatus("error");
      const message =
        caughtError instanceof ApiClientError && caughtError.status === 400
          ? messageFrom(caughtError.body)
          : undefined;
      setError(message ?? content.auth.failed);
    }
  }

  function messageFrom(body: unknown): string | undefined {
    if (body && typeof body === "object" && "message" in body && typeof body.message === "string") {
      return body.message;
    }
    return undefined;
  }

  if (status === "no-token") {
    return (
      <AuthLayout brand={content.brand.name} mark={content.brand.mark} {...content.confirm}>
        <EmptyState title={content.confirm.title} description={content.confirm.invalidToken}>
          <a className="gr-button gr-button--secondary" href="/recuperar">
            {content.confirm.tryAgain}
          </a>
        </EmptyState>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout brand={content.brand.name} mark={content.brand.mark} {...content.confirm}>
      {status === "done" ? (
        <>
          <Feedback>{content.confirm.success}</Feedback>
          <p className="link-row">
            <a href="/login">{content.confirm.goToLogin}</a>
          </p>
        </>
      ) : (
        <form className="gr-form" onSubmit={submit} aria-busy={status === "pending"}>
          <PasswordField
            name="newPassword"
            autoComplete="new-password"
            label={content.confirm.newPassword}
            showLabel={content.confirm.showPassword}
            hideLabel={content.confirm.hidePassword}
            disabled={status === "pending"}
          />
          {status === "error" && <Feedback error>{error}</Feedback>}
          <Button type="submit" disabled={status === "pending"}>
            {status === "pending" ? content.confirm.pending : content.confirm.submit}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
