import assert from "node:assert/strict";
import test from "node:test";
import { redirectViaSso } from "../features/auth/sso-redirect.ts";

function withStubs(env, handler) {
  const previousEnv = { ...process.env };
  Object.assign(process.env, env);

  const calls = [];
  globalThis.document = { cookie: "" };
  globalThis.fetch = async (path, init = {}) => {
    calls.push({ path, method: init.method, body: init.body ? JSON.parse(init.body) : null });
    return handler(path);
  };

  const redirects = [];
  globalThis.window = { location: { replace: (href) => redirects.push(href) } };

  return {
    calls,
    redirects,
    restore() {
      process.env = previousEnv;
    },
  };
}

function respondWith(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body ?? null,
    text: async () => (body ? JSON.stringify(body) : ""),
  };
}

test("ADMINISTRACION pide la audiencia admin y redirige a NEXT_PUBLIC_ADMIN_UI_URL", async () => {
  const stubs = withStubs({ NEXT_PUBLIC_ADMIN_UI_URL: "https://admin.ejemplo" }, () =>
    respondWith(200, { code: "codigo-admin" }),
  );

  await redirectViaSso(["ADMINISTRACION"]);

  assert.deepEqual(stubs.calls.at(-1).body, { audience: "admin" });
  assert.deepEqual(stubs.redirects, [
    "https://admin.ejemplo/auth/sso/callback?code=codigo-admin",
  ]);
  stubs.restore();
});

test("VIGILANTE pide la audiencia vigilante y redirige a NEXT_PUBLIC_COMMON_UI_URL", async () => {
  const stubs = withStubs({ NEXT_PUBLIC_COMMON_UI_URL: "https://comun.ejemplo" }, () =>
    respondWith(200, { code: "codigo-vigilante" }),
  );

  await redirectViaSso(["VIGILANTE"]);

  assert.deepEqual(stubs.calls.at(-1).body, { audience: "vigilante" });
  assert.deepEqual(stubs.redirects, [
    "https://comun.ejemplo/auth/sso/callback?code=codigo-vigilante",
  ]);
  stubs.restore();
});

test("RESIDENTE pide la audiencia residente y redirige a NEXT_PUBLIC_COMMON_UI_URL", async () => {
  const stubs = withStubs({ NEXT_PUBLIC_COMMON_UI_URL: "https://comun.ejemplo" }, () =>
    respondWith(200, { code: "codigo-residente" }),
  );

  await redirectViaSso(["RESIDENTE"]);

  assert.deepEqual(stubs.calls.at(-1).body, { audience: "residente" });
  assert.deepEqual(stubs.redirects, [
    "https://comun.ejemplo/auth/sso/callback?code=codigo-residente",
  ]);
  stubs.restore();
});

test("quien acumula varios roles cruza por el de mayor alcance", async () => {
  const stubs = withStubs(
    { NEXT_PUBLIC_ADMIN_UI_URL: "https://admin.ejemplo", NEXT_PUBLIC_COMMON_UI_URL: "https://comun.ejemplo" },
    () => respondWith(200, { code: "codigo" }),
  );

  await redirectViaSso(["RESIDENTE", "VIGILANTE", "ADMINISTRACION"]);

  assert.deepEqual(stubs.calls.at(-1).body, { audience: "admin" });
  stubs.restore();
});

test("sin variables de entorno usa los puertos locales por defecto", async () => {
  const stubs = withStubs({ NEXT_PUBLIC_ADMIN_UI_URL: undefined }, () =>
    respondWith(200, { code: "codigo" }),
  );
  delete process.env.NEXT_PUBLIC_ADMIN_UI_URL;

  await redirectViaSso(["ADMINISTRACION"]);

  assert.deepEqual(stubs.redirects, ["http://localhost:3001/auth/sso/callback?code=codigo"]);
  stubs.restore();
});
