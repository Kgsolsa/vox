import { Context, Hono } from "hono";
import { badRequest } from "../utils";
import { ulid } from "ulid";

const router = new Hono();

router.get("/", async ({ req, env }: Context) => {
  try {
    const data = await env.DB.prepare("select * from authors").bind().run();

    return Response.json({
      data: data.results,
    });
  } catch (error) {
    console.error(error);
    return badRequest("Failed to fetch Authors", 500);
  }
});

router.get("/:id", async ({ req, env }: Context) => {
  const id = req.param("id");

  if (!id) {
    return badRequest("ID is required", 400);
  }

  try {
    const data = await env.DB.prepare("select * from authors where id = ?").bind(id).run();

    return Response.json({
      data: data.results[0],
    });
  } catch (error) {
    console.error(error);
    return badRequest("Failed to fetch Author", 500);
  }
});

router.post("/", async ({ req, env }: Context) => {
  const body = await req.json();

  try {
    const id = ulid();
    const data = await env.DB.prepare("insert into authors (id, name, email, external_id) values (?, ?, ?, ?)").bind(id, body.name, body.email, body.external_id).run();

    return Response.json({
      data: data,
    });
  } catch (error) {
    console.error(error);
    return badRequest("Failed to create Author", 500);
  }
});

router.put("/:id", async ({ req, env }: Context) => {
  const id = req.param("id");
  const body = await req.json();

  if (!id) {
    return badRequest("ID is required", 400);
  }

  try {
    const data = await env.DB.prepare("update authors set name = ?, email = ?, external_id = ? where id = ?").bind(body.name, body.email, body.external_id, id).run();

    return Response.json({
      data: data.results,
    });
  } catch (error) {
    console.error(error);
    return badRequest("Failed to update Author", 500);
  }
});

router.delete("/:id", async ({ req, env }: Context) => {
  const id = req.param("id");

  if (!id) {
    return badRequest("ID is required", 400);
  }

  try {
    const data = await env.DB.prepare("delete from authors where id = ?").bind(id).run();

    return Response.json({
      data: data.results,
    });
  } catch (error) {
    console.error(error);
    return badRequest("Failed to delete Author", 500);
  }
});

export default router;
