"use client";

import { useEffect, useState } from "react";
import { AuthLayout, LoginForm, Skeleton, type LoginValues } from "@gestionresidencial/shared-ui";
import { AUTH_ERROR, authErrorMessage, authService } from "@gestionresidencial/auth-client";
import { content } from "@/config/content";
import { redirectViaSso } from "./sso-redirect";

type Status = "checking-session" | "idle" | "pending" | "redirecting";

export function LoginScreen() {
  const [status, setStatus] = useState<Status>("checking-session");
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;

    authService
      .getSession()
      .then((user) => {
        if (!active) return;
        if (user) {
          setStatus("redirecting");
          return redirectViaSso(user.roles);
        }
        setStatus("idle");
      })
      .catch(() => {
        if (active) setStatus("idle");
      });

    return () => {
      active = false;
    };
  }, []);

  async function submit(values: LoginValues) {
    setStatus("pending");
    setError(undefined);
    try {
      const user = await authService.login(values);
      setStatus("redirecting");
      await redirectViaSso(user.roles);
    } catch (caughtError) {
      setStatus("idle");
      setError(
        authErrorMessage(
          caughtError,
          { [AUTH_ERROR.InvalidCredentials]: content.auth.invalid },
          content.auth.failed,
        ),
      );
    }
  }

  return (
    <AuthLayout brand={content.brand.name} mark={content.brand.mark} {...content.auth}>
      {status === "checking-session" || status === "redirecting" ? (
        <Skeleton
          label={status === "redirecting" ? content.auth.redirecting : content.auth.loading}
        />
      ) : (
        <LoginForm
          labels={content.loginLabels}
          pending={status === "pending"}
          error={error}
          onSubmit={submit}
        />
      )}
      <p className="link-row">
        <a href="/recuperar">¿Olvidaste tu contraseña?</a>
      </p>
    </AuthLayout>
  );
}
