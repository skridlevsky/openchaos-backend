import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { env } from "./env.js";
import { log } from "./logger.js";

const startTime = Date.now();

const setCors = (res: ServerResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

const json = (res: ServerResponse, status: number, body: unknown) => {
  setCors(res);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

const handle = (req: IncomingMessage, res: ServerResponse) => {
  const start = Date.now();

  if (req.method === "OPTIONS") {
    setCors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    json(res, 200, {
      status: "ok",
      uptime: Math.floor((Date.now() - startTime) / 1000),
      env: env.NODE_ENV,
    });
  } else {
    json(res, 404, { error: "not found" });
  }

  log.info("request", {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    ms: Date.now() - start,
  });
};

const server = createServer(handle);

// Graceful shutdown
const shutdown = (signal: string) => {
  log.info(`${signal} received, shutting down`);
  server.close(() => {
    log.info("server closed");
    process.exit(0);
  });
  setTimeout(() => {
    log.error("forced shutdown after timeout");
    process.exit(1);
  }, 5000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (err) => {
  log.error("unhandled rejection", { err: String(err) });
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  log.error("uncaught exception", { err: err.message });
  process.exit(1);
});

server.listen(env.PORT, () => {
  log.info(`openchaos-backend listening on :${env.PORT}`);
});
