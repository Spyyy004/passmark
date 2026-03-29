import { describe, it, expect } from "vitest";
import { logger } from "../logger";

describe("logger", () => {
  it("logger instance exists and has expected methods", () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
  });

  it('logger name is "passmark-ai"', () => {
    // pino exposes bindings() which includes the name
    const bindings = logger.bindings();
    expect(bindings.name).toBe("passmark-ai");
  });

  it('default level is "info"', () => {
    expect(logger.level).toBe("info");
  });
});
