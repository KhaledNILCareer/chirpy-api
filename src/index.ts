import express from "express";

import {
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./middleware.js";

import { 
  handlerMetrics,
  handlerReadiness,
  handlerReset
} from "./handlers.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.get("/admin/reset", handlerReset);

app.use(
  "/app",
  middlewareMetricsInc,
  express.static("./src/app"),
);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


