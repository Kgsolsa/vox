import { Hono } from 'hono'

import authorsRouter from "./routes/authors";
import commentsRouter from "./routes/comments";
import likesRouter from "./routes/likes";

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/v1/authors', authorsRouter);
app.route('/v1/comments', commentsRouter);
app.route('/v1/likes', likesRouter);

export default app
