import { Context, Hono } from "hono";
import { badRequest } from "../utils";

const router = new Hono();

router.get("/", async ({ req, env }: Context) => {
  try {
    const page_id = req.query("page_id");
    const author_id = req.query("author_id");
    const comment_id = req.query("comment_id");

    let query = "SELECT * FROM comments JOIN authors ON comments.author_id = authors.id WHERE 1=1";
    const params: any[] = [];

    if (author_id) {
      query += " AND comments.author_id = ?";
      params.push(author_id);
    }

    if (page_id) {
      query += " AND comments.page_id = ?";
      params.push(page_id);
    }

    if (comment_id) {
      query += " AND comments.comment_id = ?";
      params.push(comment_id);
    }

    console.log("Query: ", query, params);

    const data = await env.DB.prepare(query)
      .bind(...params)
      .run();

    return Response.json({
      data: data.results,
    });
  } catch (error) {
    console.error(error);
    return badRequest("Failed to fetch Comments", 500);
  }
});

router.get("/:id", async ({ req, env }: Context) => {
  const id = req.param("id");

  if (!id) {
    return badRequest("ID is required", 400);
  }

  try {
    // Return Author too
    const data = await env.DB.prepare("select * from comments join authors on comments.author_id = authors.id where comments.id = ?").bind(id).run();

    return Response.json({
      data: data.results,
    });
  } catch (error) {
    console.error(error);
    return badRequest("Failed to fetch Comment", 500);
  }
});

router.post("/", async ({ req, env }: Context) => {
  const body = await req.json();

  if (!body.author_id || !body.content || !body.page_id) {
    return badRequest("author_id and content are required", 400);
  }

  try {
    const data = await env.DB.prepare("insert into comments (author_id, content, comment_id, page_id) values (?, ?, ?, ?)")
      .bind(body.author_id, body.content, body.comment_id ?? null, body.page_id)
      .run();

    return Response.json({
      data: data.results,
    });
  } catch (error) {
    console.error(error);
    return badRequest("Failed to create Comment", 500);
  }
});

router.delete("/:id", async ({ req, env }: Context) => {
  const id = req.param("id");

  if (!id) {
    return badRequest("ID is required", 400);
  }

  try {
    const data = await env.DB.prepare("delete from comments where id = ?").bind(id).run();

    return Response.json({
      data: data.results,
    });
  } catch (error) {
    console.error(error);
    return badRequest("Failed to delete Comment", 500);
  }
});

export default router;
