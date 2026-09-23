import express from "express";
import type {
  Request,
  Response,
  NextFunction,
} from "express";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
// Readiness endpoint
app.get("/healthz", handlerReadiness);

// Serve static files

app.use("/app", express.static("./src/app"));

function handlerReadiness(req: Request, res: Response): void {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
}

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



app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


