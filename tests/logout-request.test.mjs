import assert from "node:assert/strict";
import test from "node:test";
import { isLogoutRequest } from "../features/auth/logout-request.ts";

test("reconoce logout=1 con o sin otros parametros", () => {
  assert.equal(isLogoutRequest("?logout=1"), true);
  assert.equal(isLogoutRequest("?next=%2Fperfil&logout=1"), true);
});

test("ignora la ausencia del parametro y valores distintos de 1", () => {
  assert.equal(isLogoutRequest(""), false);
  assert.equal(isLogoutRequest("?next=%2Fperfil"), false);
  assert.equal(isLogoutRequest("?logout=0"), false);
  assert.equal(isLogoutRequest("?logout=true"), false);
});
