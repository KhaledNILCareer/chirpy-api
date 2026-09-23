import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { config } from "./config.js";

export function middlewareLogResponses(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.on("finish", () => {
    const resCode = res.statusCode;

    if (resCode < 200 || resCode > 299) {
      console.log(
        `[NON-OK] ${req.method} ${req.url} - Status: ${resCode}`
      );
    }
  });

  next();
}

export function middlewareMetricsInc(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  config.fileserverHits++;
  next();
}