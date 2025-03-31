import { Context, Hono } from "hono";
import { badRequest } from "../utils";
import { ulid } from "ulid";
import { deleteComment, getCommentById, insertComment, listComments } from "../service/database";

const router = new Hono();

router.get("/", async ({ req, env }: Context) => {
  try {
    const page_id = req.query("page_id");
    const author_id = req.query("author_id");
    const comment_id = req.query("comment_id");

    const limit = req.query("limit") ?? "1";
    const offset = req.query("offset") ?? "0";

    const data = await listComments(env, author_id, page_id, comment_id, limit, offset);

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return badRequest("Failed to fetch Comments", 500);
  }
});

router.post("/", async ({ req, env }: Context) => {
  const body = await req.json();

  if (!body.author_id || !body.content || !body.page_id) {
    return badRequest("author_id and content are required", 400);
  }

  try {
    const data = await insertComment(env, body);
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return badRequest("Failed to create Comment", 500);
  }
});

router.get("/:id", async ({ req, env }: Context) => {
  const id = req.param("id");

  if (!id) {
    return badRequest("ID is required", 400);
  }

  try {
    const data = await getCommentById(env, id);

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return badRequest("Failed to fetch Comment", 500);
  }
});

router.delete("/:id", async ({ req, env }: Context) => {
  const id = req.param("id");

  if (!id) {
    return badRequest("ID is required", 400);
  }

  try {
    const data = await deleteComment(env, id);
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return badRequest("Failed to delete Comment", 500);
  }
});

export default router;
