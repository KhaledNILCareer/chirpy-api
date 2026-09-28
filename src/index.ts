import express from "express";
import { config } from "./config.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import {
  middlewareLogResponses,
  middlewareMetricsInc,
  middlewareErrorHandler
} from "./middleware.js";

import { 
  handlerMetrics,
  handlerReadiness,
  handlerReset,
  handlerCreateChirp,
  handlerGetChirps,
  handlerGetChirp,
  handlerCreateUser
} from "./handlers.js";

const migrationClient = postgres(config.db.url, { max: 1 });

await migrate(
  drizzle(migrationClient),
  config.db.migrationConfig,
);

const app = express();

app.use(express.json());
app.use(middlewareLogResponses);

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);
app.post("/api/chirps", handlerCreateChirp);
app.get("/api/chirps", handlerGetChirps);
app.get("/api/chirps/:chirpId", handlerGetChirp);
app.post("/api/users", handlerCreateUser);

app.use(
  "/app",
  middlewareMetricsInc,
  express.static("./src/app"),
);

app.use(middlewareErrorHandler);

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});


