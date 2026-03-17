import { NextRequest, NextResponse } from "next/server";
import client from "prom-client";

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
client.collectDefaultMetrics({
  register,
  prefix: "enquiry_app_",
});

// Optionally, create custom metrics here:
// const httpRequestDurationMicroseconds = new client.Histogram({
//   name: 'http_request_duration_seconds',
//   help: 'Duration of HTTP requests in microseconds',
//   labelNames: ['method', 'route', 'code'],
//   buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
// });
// register.registerMetric(httpRequestDurationMicroseconds);

export async function GET(req: NextRequest) {
  try {
    const metrics = await register.metrics();
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        "Content-Type": register.contentType,
      },
    });
  } catch (ex) {
    return new NextResponse("Error generating metrics", { status: 500 });
  }
}
