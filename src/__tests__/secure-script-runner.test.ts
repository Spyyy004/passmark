import { describe, expect, it, vi } from "vitest";
import type { Page } from "@playwright/test";
import { runSecureScript, validateScript } from "../utils/secure-script-runner";

vi.mock("../logger", () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

function createMockPage() {
  const mockLocator: Record<string, ReturnType<typeof vi.fn>> = {
    click: vi.fn().mockResolvedValue(undefined),
    dblclick: vi.fn().mockResolvedValue(undefined),
    fill: vi.fn().mockResolvedValue(undefined),
    type: vi.fn().mockResolvedValue(undefined),
    press: vi.fn().mockResolvedValue(undefined),
    check: vi.fn().mockResolvedValue(undefined),
    uncheck: vi.fn().mockResolvedValue(undefined),
    hover: vi.fn().mockResolvedValue(undefined),
    focus: vi.fn().mockResolvedValue(undefined),
    blur: vi.fn().mockResolvedValue(undefined),
    selectOption: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
    scrollIntoViewIfNeeded: vi.fn().mockResolvedValue(undefined),
    textContent: vi.fn().mockResolvedValue("test content"),
    innerText: vi.fn().mockResolvedValue("inner text"),
    innerHTML: vi.fn().mockResolvedValue("<b>html</b>"),
    getAttribute: vi.fn().mockResolvedValue("attr-value"),
    inputValue: vi.fn().mockResolvedValue("input-value"),
    count: vi.fn().mockResolvedValue(3),
    isVisible: vi.fn().mockResolvedValue(true),
    isEnabled: vi.fn().mockResolvedValue(true),
    isChecked: vi.fn().mockResolvedValue(false),
    waitFor: vi.fn().mockResolvedValue(undefined),
    first: vi.fn(),
    last: vi.fn(),
    nth: vi.fn(),
    filter: vi.fn(),
    locator: vi.fn(),
    getByRole: vi.fn(),
    getByText: vi.fn(),
    getByLabel: vi.fn(),
    getByPlaceholder: vi.fn(),
    getByTestId: vi.fn(),
    getByAltText: vi.fn(),
    getByTitle: vi.fn(),
  };

  // Chain methods return mockLocator
  for (const m of [
    "first",
    "last",
    "nth",
    "filter",
    "locator",
    "getByRole",
    "getByText",
    "getByLabel",
    "getByPlaceholder",
    "getByTestId",
    "getByAltText",
    "getByTitle",
  ]) {
    mockLocator[m].mockReturnValue(mockLocator);
  }

  return {
    locator: vi.fn().mockReturnValue(mockLocator),
    getByRole: vi.fn().mockReturnValue(mockLocator),
    getByText: vi.fn().mockReturnValue(mockLocator),
    getByLabel: vi.fn().mockReturnValue(mockLocator),
    getByPlaceholder: vi.fn().mockReturnValue(mockLocator),
    getByTestId: vi.fn().mockReturnValue(mockLocator),
    getByAltText: vi.fn().mockReturnValue(mockLocator),
    getByTitle: vi.fn().mockReturnValue(mockLocator),
    frameLocator: vi.fn().mockReturnValue(mockLocator),
    goto: vi.fn().mockResolvedValue(undefined),
    reload: vi.fn().mockResolvedValue(undefined),
    goBack: vi.fn().mockResolvedValue(undefined),
    goForward: vi.fn().mockResolvedValue(undefined),
    url: vi.fn().mockReturnValue("https://example.com"),
    title: vi.fn().mockResolvedValue("Test Page"),
    content: vi.fn().mockResolvedValue("<html></html>"),
    screenshot: vi.fn().mockResolvedValue(Buffer.from("")),
    close: vi.fn().mockResolvedValue(undefined),
    bringToFront: vi.fn().mockResolvedValue(undefined),
    setViewportSize: vi.fn().mockResolvedValue(undefined),
    waitForLoadState: vi.fn().mockResolvedValue(undefined),
    waitForURL: vi.fn().mockResolvedValue(undefined),
    waitForTimeout: vi.fn().mockResolvedValue(undefined),
    waitForSelector: vi.fn().mockResolvedValue(undefined),
    keyboard: {
      press: vi.fn().mockResolvedValue(undefined),
      type: vi.fn().mockResolvedValue(undefined),
      down: vi.fn().mockResolvedValue(undefined),
      up: vi.fn().mockResolvedValue(undefined),
      insertText: vi.fn().mockResolvedValue(undefined),
    },
    mouse: {
      click: vi.fn().mockResolvedValue(undefined),
      dblclick: vi.fn().mockResolvedValue(undefined),
      down: vi.fn().mockResolvedValue(undefined),
      up: vi.fn().mockResolvedValue(undefined),
      move: vi.fn().mockResolvedValue(undefined),
      wheel: vi.fn().mockResolvedValue(undefined),
    },
    context: vi.fn().mockReturnValue({
      cookies: vi.fn().mockResolvedValue([]),
      addCookies: vi.fn().mockResolvedValue(undefined),
      clearCookies: vi.fn().mockResolvedValue(undefined),
      storageState: vi.fn().mockResolvedValue({}),
      clearPermissions: vi.fn().mockResolvedValue(undefined),
      setGeolocation: vi.fn().mockResolvedValue(undefined),
      setOffline: vi.fn().mockResolvedValue(undefined),
      waitForEvent: vi.fn().mockResolvedValue(undefined),
      browser: vi.fn().mockReturnValue({
        isConnected: vi.fn().mockReturnValue(true),
        version: vi.fn().mockReturnValue("1.0"),
      }),
    }),
  } as unknown as Page;
}

describe("secure-script-runner", () => {
  describe("validateScript", () => {
    describe("allowed scripts", () => {
      it("allows page.locator with click", () => {
        expect(() => validateScript(`page.locator('#btn').click()`)).not.toThrow();
      });

      it("allows page.getByRole with options and click", () => {
        expect(() =>
          validateScript(`page.getByRole('button', { name: 'Submit' }).click()`),
        ).not.toThrow();
      });

      it("allows page.getByText with .first().click()", () => {
        expect(() => validateScript(`page.getByText('Hello').first().click()`)).not.toThrow();
      });

      it("allows page.getByLabel with fill", () => {
        expect(() =>
          validateScript(`page.getByLabel('Email').fill('test@test.com')`),
        ).not.toThrow();
      });

      it("allows page.locator with .nth() and hover", () => {
        expect(() => validateScript(`page.locator('.item').nth(2).hover()`)).not.toThrow();
      });

      it("allows page.goto", () => {
        expect(() => validateScript(`page.goto('https://example.com')`)).not.toThrow();
      });

      it("allows page.reload", () => {
        expect(() => validateScript(`page.reload()`)).not.toThrow();
      });

      it("allows page.keyboard.press", () => {
        expect(() => validateScript(`page.keyboard.press('Enter')`)).not.toThrow();
      });

      it("allows page.mouse.click", () => {
        expect(() => validateScript(`page.mouse.click(100, 200)`)).not.toThrow();
      });

      it("allows page.waitForLoadState", () => {
        expect(() => validateScript(`page.waitForLoadState('networkidle')`)).not.toThrow();
      });

      it("allows page.getByTestId with waitFor", () => {
        expect(() =>
          validateScript(`page.getByTestId('submit').waitFor({ state: 'visible' })`),
        ).not.toThrow();
      });

      it("allows multi-line scripts with multiple allowed statements", () => {
        const script = `
          page.getByLabel('Email').fill('user@example.com')
          page.getByLabel('Password').fill('password123')
          page.getByRole('button', { name: 'Login' }).click()
        `;
        expect(() => validateScript(script)).not.toThrow();
      });

      it("allows page.getByPlaceholder with fill", () => {
        expect(() => validateScript(`page.getByPlaceholder('Search').fill('query')`)).not.toThrow();
      });

      it("allows page.locator chained with .last().click()", () => {
        expect(() => validateScript(`page.locator('li').last().click()`)).not.toThrow();
      });

      it("allows page.keyboard.type", () => {
        expect(() => validateScript(`page.keyboard.type('hello world')`)).not.toThrow();
      });

      it("allows page.mouse.move", () => {
        expect(() => validateScript(`page.mouse.move(50, 60)`)).not.toThrow();
      });

      it("allows locator chain with filter", () => {
        expect(() =>
          validateScript(`page.locator('div').filter({ hasText: 'Hello' }).click()`),
        ).not.toThrow();
      });

      it("allows page.waitForURL", () => {
        expect(() =>
          validateScript(`page.waitForURL('https://example.com/dashboard')`),
        ).not.toThrow();
      });

      it("allows page.title", () => {
        expect(() => validateScript(`page.title()`)).not.toThrow();
      });

      it("allows fetch to external URL", () => {
        expect(() => validateScript(`fetch('https://api.example.com/data')`)).not.toThrow();
      });

      it("allows long locator chain", () => {
        expect(() =>
          validateScript(
            `page.locator('div').locator('ul').locator('li').first().getByText('Item').click()`,
          ),
        ).not.toThrow();
      });

      it("allows scripts with only comments to be treated as empty (throws empty error)", () => {
        expect(() => validateScript(`// this is a comment`)).toThrow("Script is empty");
      });

      it("allows page.screenshot", () => {
        expect(() => validateScript(`page.screenshot()`)).not.toThrow();
      });
    });

    describe("disallowed scripts", () => {
      it("rejects eval calls", () => {
        expect(() => validateScript(`eval('alert(1)')`)).toThrow();
      });

      it("rejects require calls", () => {
        expect(() => validateScript(`require('fs')`)).toThrow();
      });

      it("rejects process access", () => {
        expect(() => validateScript(`process.env.SECRET`)).toThrow();
      });

      it("rejects Function constructor", () => {
        expect(() => validateScript(`new Function('return 1')()`)).toThrow();
      });

      it("rejects dynamic import expressions", () => {
        expect(() => validateScript(`import('fs')`)).toThrow();
      });

      it("rejects globalThis access", () => {
        expect(() => validateScript(`globalThis.fetch('http://evil.com')`)).toThrow();
      });

      it("rejects arbitrary identifiers as chain start", () => {
        expect(() => validateScript(`window.location.href`)).toThrow();
      });

      it("rejects arbitrary function calls not starting with page", () => {
        expect(() => validateScript(`alert('hello')`)).toThrow();
      });

      it("rejects assignment expressions", () => {
        expect(() => validateScript(`x = 1`)).toThrow();
      });

      it("rejects var declarations (only const/let allowed)", () => {
        expect(() => validateScript(`var x = 'hello'`)).toThrow();
      });

      it("rejects reserved variable names in declarations", () => {
        expect(() => validateScript(`const page = 'test'`)).toThrow();
      });

      it("rejects fetch to localhost", () => {
        expect(() => validateScript(`fetch('http://localhost:3000/api')`)).toThrow(/Blocked URL/);
      });

      it("rejects fetch to 127.0.0.1", () => {
        expect(() => validateScript(`fetch('http://127.0.0.1:8080/data')`)).toThrow(/Blocked URL/);
      });

      it("rejects fetch to 0.0.0.0", () => {
        expect(() => validateScript(`fetch('http://0.0.0.0/data')`)).toThrow(/Blocked URL/);
      });

      it("rejects disallowed methods on locator chain", () => {
        expect(() => validateScript(`page.locator('div').evaluate('code')`)).toThrow(
          /Disallowed method/,
        );
      });

      it("rejects action method not at the end of chain", () => {
        expect(() => validateScript(`page.locator('div').click().fill('x')`)).toThrow();
      });
    });

    describe("edge cases", () => {
      it("throws on empty script", () => {
        expect(() => validateScript("")).toThrow("Script is empty");
      });

      it("throws on script with only whitespace", () => {
        expect(() => validateScript("   \n   \n   ")).toThrow("Script is empty");
      });

      it("strips inline comments and validates remaining code", () => {
        expect(() =>
          validateScript(`page.locator('#btn').click() // click the button`),
        ).not.toThrow();
      });

      it("handles trailing semicolons", () => {
        expect(() => validateScript(`page.locator('#btn').click();`)).not.toThrow();
      });

      it("handles placeholders in validation mode", () => {
        expect(() =>
          validateScript(`page.getByLabel('Email').fill('{{run.email}}')`),
        ).not.toThrow();
      });

      it("rejects fetch to private IP ranges (10.x.x.x)", () => {
        expect(() => validateScript(`fetch('http://10.0.0.1/internal')`)).toThrow(/Blocked URL/);
      });

      it("rejects fetch to private IP ranges (192.168.x.x)", () => {
        expect(() => validateScript(`fetch('http://192.168.1.1/internal')`)).toThrow(/Blocked URL/);
      });

      it("rejects fetch with non-http protocol", () => {
        expect(() => validateScript(`fetch('ftp://files.example.com')`)).toThrow(/http or https/);
      });
    });
  });

  describe("runSecureScript", () => {
    it("executes page.locator().click() correctly", async () => {
      const page = createMockPage();
      await runSecureScript({ page, script: `page.locator('#btn').click()` });
      expect(page.locator).toHaveBeenCalledWith("#btn");
    });

    it("executes page.getByRole().click() with options", async () => {
      const page = createMockPage();
      await runSecureScript({
        page,
        script: `page.getByRole('button', { name: 'Submit' }).click()`,
      });
      expect(page.getByRole).toHaveBeenCalledWith("button", { name: "Submit" });
    });

    it("executes page.goto()", async () => {
      const page = createMockPage();
      await runSecureScript({
        page,
        script: `page.goto('https://example.com')`,
      });
      expect(page.goto).toHaveBeenCalledWith("https://example.com");
    });

    it("executes page.reload()", async () => {
      const page = createMockPage();
      await runSecureScript({ page, script: `page.reload()` });
      expect(page.reload).toHaveBeenCalled();
    });

    it("executes page.keyboard.press()", async () => {
      const page = createMockPage();
      await runSecureScript({ page, script: `page.keyboard.press('Enter')` });
      expect(page.keyboard.press).toHaveBeenCalledWith("Enter");
    });

    it("executes page.mouse.click()", async () => {
      const page = createMockPage();
      await runSecureScript({ page, script: `page.mouse.click(100, 200)` });
      expect(page.mouse.click).toHaveBeenCalledWith(100, 200);
    });

    it("executes page.waitForLoadState()", async () => {
      const page = createMockPage();
      await runSecureScript({
        page,
        script: `page.waitForLoadState('networkidle')`,
      });
      expect(page.waitForLoadState).toHaveBeenCalledWith("networkidle");
    });

    it("executes multi-line scripts sequentially", async () => {
      const page = createMockPage();
      const script = `
        page.getByLabel('Email').fill('user@test.com')
        page.getByRole('button', { name: 'Submit' }).click()
      `;
      await runSecureScript({ page, script });
      expect(page.getByLabel).toHaveBeenCalledWith("Email");
      expect(page.getByRole).toHaveBeenCalledWith("button", { name: "Submit" });
    });

    it("interpolates run placeholders", async () => {
      const page = createMockPage();
      await runSecureScript({
        page,
        script: `page.getByLabel('Email').fill('{{run.email}}')`,
        localValues: { email: "hello@world.com" },
      });
      expect(page.getByLabel).toHaveBeenCalledWith("Email");
    });

    it("throws on empty script at runtime", async () => {
      const page = createMockPage();
      await expect(runSecureScript({ page, script: "" })).rejects.toThrow("Script is empty");
    });

    it("throws on disallowed eval at runtime", async () => {
      const page = createMockPage();
      await expect(runSecureScript({ page, script: `eval('alert(1)')` })).rejects.toThrow();
    });
  });
});
