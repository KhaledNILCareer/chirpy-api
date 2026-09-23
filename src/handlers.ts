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
  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(`
    <html>
      <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${config.fileserverHits} times!</p>
      </body>
    </html>
    `)
}

export function handlerReset(
  req: Request,
  res: Response,
): void {
  config.fileserverHits = 0;

  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("Hits are reset.");
}

export function handlerValidateChirp(
  req: Request,
  res: Response,
): void {
  const body = req.body?.body;

  // TODO: Validate the request body
  if(!body || typeof body !== "string"){
    res.status(400).json({"error":"Invalid chirp body"})
    return
  }
  if(body.length > 140){
    res.status(400).json({ error: "Chirp is too long" });
    return
  }
  res.status(200).json({
    cleanedBody: cleanChirp(body),
  });
}

function cleanChirp(body: string): string {
  const profaneWords = ["kerfuffle", "sharbert", "fornax"];

  const cleanedWords = body.split(" ").map((originalWord) => {
    const normalizedWord = originalWord.toLowerCase();

    return profaneWords.includes(normalizedWord)
      ? "****"
      : originalWord;
  });

  return cleanedWords.join(" ");
}