import { describe, it, expect, vi, beforeEach } from "vitest";
import { configure, resetConfig } from "../config";
import { generateEmail } from "../email";

beforeEach(() => {
  resetConfig();
});

describe("generateEmail", () => {
  it("throws when no email provider is configured", () => {
    expect(() => generateEmail()).toThrow("Email provider not configured");
  });

  it("returns correct format with configured provider", () => {
    configure({ email: { domain: "test.com", extractContent: vi.fn() } });
    const email = generateEmail({ timestamp: 1000 });
    expect(email).toBe("test.user.1000@test.com");
  });

  it("uses default prefix 'test.user'", () => {
    configure({ email: { domain: "test.com", extractContent: vi.fn() } });
    const email = generateEmail({ timestamp: 5555 });
    expect(email).toMatch(/^test\.user\.\d+@test\.com$/);
    expect(email).toBe("test.user.5555@test.com");
  });

  it("uses custom prefix", () => {
    configure({ email: { domain: "test.com", extractContent: vi.fn() } });
    const email = generateEmail({ prefix: "custom.prefix", timestamp: 9999 });
    expect(email).toBe("custom.prefix.9999@test.com");
  });

  it("uses provided timestamp", () => {
    configure({ email: { domain: "test.com", extractContent: vi.fn() } });
    const ts = 1234567890;
    const email = generateEmail({ timestamp: ts });
    expect(email).toBe(`test.user.${ts}@test.com`);
  });
});
