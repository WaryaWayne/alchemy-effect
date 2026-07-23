import { fileURLToPath } from "node:url";
import { describe, expect, test } from "alchemy-test";

const resolveAlchemy = (specifier: string) =>
  fileURLToPath(import.meta.resolve(specifier));

describe("package exports", () => {
  test("resolves Cloudflare Worker leaves without routing through the service barrel", () => {
    expect(
      resolveAlchemy("alchemy/Cloudflare/Workers/ConfigProvider"),
    ).toBe(
      fileURLToPath(
        new URL("../src/Cloudflare/Workers/ConfigProvider.ts", import.meta.url),
      ),
    );
    expect(resolveAlchemy("alchemy/Drizzle/Postgres")).toBe(
      fileURLToPath(new URL("../src/Drizzle/Postgres.ts", import.meta.url)),
    );
  });

  test("keeps the ConfigProvider leaf free of the plan-time bundler", async () => {
    const result = await Bun.build({
      entrypoints: [
        resolveAlchemy("alchemy/Cloudflare/Workers/ConfigProvider"),
      ],
      packages: "external",
      target: "browser",
      write: false,
    });

    expect(result.logs).toEqual([]);
    expect(result.success).toBe(true);

    const output = await result.outputs[0]?.text();
    expect(output).toBeDefined();
    expect(output).not.toMatch(/from\s+["']rolldown["']/);
  });
});
