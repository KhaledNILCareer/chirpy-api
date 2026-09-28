import type { Request, Response } from "express";
import { config } from "./config.js";
import { BadRequestError } from "./errors.js";
import { createUser, deleteAllUsers } from "./db/queries/users.js";
import { createChirp, getAllChirps } from "./db/queries/chirps.js";

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
        <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
      </body>
    </html>
    `)
}

export async function handlerReset(
  req: Request,
  res: Response,
): Promise<void> {
  if(config.api.platform !== "dev"){
    res.status(403).json({
      error: "Forbidden",
    })
    return;
  }

  await deleteAllUsers()
  config.api.fileserverHits = 0;

  res.status(200).json({
    message: "Reset successful",
  });
}

export async function handlerCreateChirp(
  req: Request,
  res: Response,
): Promise<void> {
  const body = req.body?.body;
  const userId = req.body?.userId;

  if (!body || typeof body !== "string") {
    res.status(400).json({
      error: "Invalid chirp body",
    });
    return;
  }

  if (body.length > 140) {
    throw new BadRequestError(
      "Chirp is too long. Max length is 140"
    );
  }

  const cleanedBody = cleanChirp(body);

  const chirp = await createChirp({
    body: cleanedBody,
    userId: userId,
  });

  res.status(201).json(chirp);
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

export async function handlerCreateUser(req: Request, res: Response) {
  const body = req.body;

  const user = await createUser({
    email: body.email,
  });

  res.status(201).json(user);
}

export async function handlerGetChirps(
  req: Request,
  res: Response,
): Promise<void> {
  const chirps = await getAllChirps()
  res.status(200).json(chirps)
}
