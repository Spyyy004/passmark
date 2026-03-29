# Passmark

AI agents that test user flows like a human.

Passmark uses AI models to execute browser-based test steps via Playwright, with intelligent caching, auto-healing, and multi-model assertion verification.

## Quick Start

```bash
npm install passmark @playwright/test
```

Set required environment variables:

```bash
export REDIS_URL=redis://localhost:6379
export ANTHROPIC_API_KEY=sk-ant-...
export GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

Basic usage with Playwright:

```typescript
import { test } from "@playwright/test";
import { runSteps } from "passmark";

test("user signup flow", async ({ page }) => {
  await runSteps({
    page,
    userFlow: "User Signup",
    steps: [
      { description: "Navigate to the signup page" },
      { description: "Fill in the email field", data: { value: "test@example.com" } },
      { description: "Click the submit button" },
    ],
  });
});
```

## Core Functions

### `runSteps(options: RunStepsOptions)`

Executes a sequence of steps using AI with caching. Each step is described in natural language and executed via browser automation tools.

```typescript
await runSteps({
  page,
  userFlow: "Checkout Flow",
  steps: [
    { description: "Add item to cart" },
    { description: "Go to checkout" },
    { description: "Fill in shipping details", data: { value: "123 Main St" } },
  ],
  assertions: [{ assertion: "Order confirmation is displayed" }],
  expect,
});
```

### `runUserFlow(options: UserFlowOptions)`

Runs a complete user flow as a single AI agent call. Best for exploratory testing where exact steps are flexible.

```typescript
const result = await runUserFlow({
  page,
  userFlow: "Complete a purchase",
  steps: "Navigate to store, add an item, checkout with test card",
  website: "https://mystore.example.com",
  effort: "high",
});
```

### `assert(options: AssertionOptions)`

Multi-model consensus assertion. Runs Claude and Gemini in parallel; if they disagree, a third model arbitrates.

```typescript
const result = await assert({
  page,
  assertion: "The dashboard shows 3 active projects",
  expect,
});
```

### `generatePlaywrightTest(page, settings)`

Streams a generated Playwright test script from a natural language description.

### `executeWithAutoHealing(config)`

Wraps cached Playwright flows with AI fallback for auto-healing when cached steps break.

## Configuration

Call `configure()` once before using any functions:

```typescript
import { configure } from "passmark";

configure({
  ai: {
    gateway: "none", // "none" (default) or "vercel"
    models: {
      stepExecution: "google/gemini-3-flash",
      utility: "google/gemini-2.5-flash",
    },
  },
  uploadBasePath: "./test-uploads",
});
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | Yes | - | Redis connection URL for step caching and global state |
| `ANTHROPIC_API_KEY` | Yes | - | Anthropic API key for Claude models |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | - | Google API key for Gemini models |
| `AI_GATEWAY_API_KEY` | If gateway=vercel | - | Vercel AI Gateway API key |
| `AXIOM_TOKEN` | No | - | Axiom token for OpenTelemetry tracing |
| `AXIOM_DATASET` | No | - | Axiom dataset for trace storage |
| `PASSMARK_LOG_LEVEL` | No | `info` | Log level: `debug`, `info`, `warn`, `error`, `silent` |

## Model Configuration

All models are configurable via `configure({ ai: { models: { ... } } })`:

| Key | Default | Used For |
|-----|---------|----------|
| `playwrightGeneration` | `anthropic/claude-4.5-sonnet` | Generating Playwright test scripts |
| `stepExecution` | `google/gemini-3-flash` | Executing individual steps |
| `userFlowLow` | `google/gemini-3-flash-preview` | User flow execution (low effort) |
| `userFlowHigh` | `google/gemini-3-pro-preview` | User flow execution (high effort) |
| `assertionPrimary` | `anthropic/claude-4.5-haiku` | Primary assertion model (Claude) |
| `assertionSecondary` | `google/gemini-3-flash` | Secondary assertion model (Gemini) |
| `assertionArbiter` | `google/gemini-3-pro-preview` | Arbiter for assertion disagreements |
| `utility` | `google/gemini-2.5-flash` | Data extraction, wait conditions |

## Caching

Passmark caches successful step actions in Redis. On subsequent runs, cached steps execute directly without AI calls, dramatically reducing latency and cost.

- Steps are cached by `userFlow` + `step.description`
- Set `bypassCache: true` on individual steps or the entire run to force AI execution
- Cache is automatically bypassed on Playwright retries

## Telemetry

Telemetry is opt-in. Set `AXIOM_TOKEN` and `AXIOM_DATASET` to enable OpenTelemetry tracing via Axiom. All AI calls are wrapped with `withSpan` for observability.

Without these env vars, telemetry is a no-op.

## Email Extraction

Configure an email provider for testing flows that involve email verification:

```typescript
import { configure } from "passmark";
import { emailsinkProvider } from "passmark/providers/emailsink";

configure({
  email: emailsinkProvider({ secret: process.env.EMAILSINK_SECRET }),
});
```

Or implement a custom provider:

```typescript
configure({
  email: {
    domain: "my-test-mail.com",
    extractContent: async ({ email, prompt }) => {
      // Fetch and extract content from your email service
      return extractedValue;
    },
  },
});
```

Use in steps with the `{{email.*}}` placeholder pattern:

```typescript
{
  description: "Enter the verification code",
  data: { value: "{{email.otp:get the 6 digit verification code}}" }
}
```

## Placeholder System

Dynamic values can be injected into step data using placeholders:

| Pattern | Scope | Description |
|---------|-------|-------------|
| `{{run.email}}` | Per run | Random email (faker) |
| `{{run.dynamicEmail}}` | Per run | Email using configured domain |
| `{{run.fullName}}` | Per run | Random full name |
| `{{run.shortid}}` | Per run | Short unique ID |
| `{{run.phoneNumber}}` | Per run | Random phone number |
| `{{global.email}}` | Per execution | Shared across runSteps calls with same `executionId` |
| `{{global.dynamicEmail}}` | Per execution | Shared dynamic email |
| `{{data.key}}` | Per project | Stored in Redis, managed via project settings |
| `{{email.type:prompt}}` | Resolved lazily | Extract content from received email |

## Architecture Overview

```
Step Request
    |
    v
[Cache Check] --hit--> [Execute Cached Action] --success--> Done
    |                          |
    miss                     fail (auto-heal)
    |                          |
    v                          v
[AI Execution] ---------> [Cache Result]
    |
    v
[Assertions] (Claude + Gemini consensus)
```

## Known Limitations

- Uses Playwright's private `_snapshotForAI()` API for accessibility snapshots. This API is not part of Playwright's public contract and may change in future versions.
- Requires `@playwright/test@1.57.0` as a peer dependency.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, code style, and PR workflow.

## License

[FSL-1.1-Apache-2.0](./LICENSE) - Functional Source License, Version 1.1, with Apache 2.0 future license.
