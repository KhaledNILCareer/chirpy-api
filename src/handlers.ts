import type { Request, Response } from "express";
import { config } from "./config.js";

export function handlerReadiness(req: Request, res: Response): void {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
}

export function handlerMetrics(
  req: Request,
  res: Response,
): void {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send(`Hits: ${config.fileserverHits}`)
}

export function handlerReset(
  req: Request,
  res: Response,
): void {
  config.fileserverHits = 0;

  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("Hits are reset.");
}