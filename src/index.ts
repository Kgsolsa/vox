import { Hono } from "hono";
import { cors } from "hono/cors";

import authorsRouter from "./routes/authors";
import commentsRouter from "./routes/comments";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(cors());

app.get("/", c => {
  return c.text("Hello Hono!");
});

app.route("/v1/authors", authorsRouter);
app.route("/v1/comments", commentsRouter);

export default app;
