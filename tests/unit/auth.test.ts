import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { profileSchema, signInSchema, signUpSchema } from "@/lib/auth/schemas";

describe("safeRedirectPath", () => {
  it.each([
    ["/conta", "/conta"],
    ["/noticias?pagina=2", "/noticias?pagina=2"],
    ["/artigos/x#topo", "/artigos/x#topo"],
  ])("aceita caminho interno %s", (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected);
  });

  it.each([
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "\\\\evil.com",
    "javascript:alert(1)",
    "/\u0000",
    "/conta\nSet-Cookie:x",
    "",
    undefined,
    42,
  ])("bloqueia %s", (input) => {
    expect(safeRedirectPath(input, "/padrao")).toBe("/padrao");
  });

  it("mantém quebras de linha codificadas como texto, sem decodificar", () => {
    expect(safeRedirectPath("/%0d%0aSet-Cookie:x")).toBe("/%0d%0aSet-Cookie:x");
  });
});


describe("validação de formulários", () => {
  it("normaliza e-mail e exige senha", () => {
    const result = signInSchema.safeParse({ email: "  Pessoa@Exemplo.COM ", password: "x" });
    expect(result.success && result.data.email).toBe("pessoa@exemplo.com");
    expect(signInSchema.safeParse({ email: "invalido", password: "x" }).success).toBe(false);
  });

  it("cadastro exige senha forte e confirmação igual", () => {
    const valid = { displayName: "Ana", email: "ana@exemplo.com", password: "senha1234", confirmPassword: "senha1234" };
    expect(signUpSchema.safeParse(valid).success).toBe(true);
    expect(signUpSchema.safeParse({ ...valid, password: "curta1", confirmPassword: "curta1" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...valid, password: "semnumeros", confirmPassword: "semnumeros" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...valid, confirmPassword: "outra1234" }).success).toBe(false);
  });

  it("cadastro não aceita campos extras como papel", () => {
    const parsed = signUpSchema.parse({
      displayName: "Ana",
      email: "ana@exemplo.com",
      password: "senha1234",
      confirmPassword: "senha1234",
      role: "admin",
    });
    expect(parsed).not.toHaveProperty("role");
  });

  it("perfil: username restrito e interesses deduplicados", () => {
    const parsed = profileSchema.parse({ displayName: "Ana", username: "Ana_Dados", bio: "", interests: "SQL, Python, SQL" });
    expect(parsed).toEqual({ displayName: "Ana", username: "ana_dados", bio: null, interests: ["SQL", "Python"] });
    expect(profileSchema.safeParse({ displayName: "Ana", username: "a b", bio: "", interests: "" }).success).toBe(false);
  });
});
