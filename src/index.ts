import express from "express";

import {
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./middleware.js";

import { 
  handlerMetrics,
  handlerReadiness,
  handlerReset,
  handlerValidateChirp
} from "./handlers.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(middlewareLogResponses);

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);
app.post("/api/validate_chirp", handlerValidateChirp);

app.use(
  "/app",
  middlewareMetricsInc,
  express.static("./src/app"),
);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


