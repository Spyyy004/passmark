import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { trace } from "@opentelemetry/api";
import { initAxiomAI, RedactionPolicy } from "axiom/ai";
import { logger } from "./logger";

const axiomToken = process.env.AXIOM_TOKEN;
const axiomDataset = process.env.AXIOM_DATASET;

export const axiomEnabled = !!(axiomToken && axiomDataset);

if (axiomToken && axiomDataset) {
  logger.info("Axiom AI instrumentation enabled");
  const tracer = trace.getTracer("ai-logs-tracer");

  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes(
      {
        [ATTR_SERVICE_NAME]: "passmark",
      },
      {
        schemaUrl: "https://opentelemetry.io/schemas/1.37.0",
      },
    ),
    spanProcessors: [
      new SimpleSpanProcessor(
        new OTLPTraceExporter({
          url: `https://api.axiom.co/v1/traces`,
          headers: {
            Authorization: `Bearer ${axiomToken}`,
            "X-Axiom-Dataset": axiomDataset,
          },
        }),
      ),
    ],
  });

  provider.register();

  initAxiomAI({ tracer, redactionPolicy: RedactionPolicy.AxiomDefault });
}
