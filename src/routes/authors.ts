import { Context, Hono } from "hono";

import { deleteAuthor, getAuthorById, insertAuthor, listAuthors } from "../service/database";

import { badRequest } from "../utils";
import { Author } from "../types";

const router = new Hono();

router.get("/", async ({ req, env }: Context) => {
  try {
    const data = await listAuthors(env);

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return badRequest("Failed to fetch Authors", 500);
  }
});

router.post("/", async ({ req, env }: Context) => {
  const body = await req.json();

  try {
    const data = (await insertAuthor(env, body)) as Author;

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return badRequest("Failed to create Author", 500);
  }
});

router.get("/:id", async ({ req, env }: Context) => {
  const id = req.param("id");

  if (!id) {
    return badRequest("ID is required", 400);
  }

  try {
    const data = (await getAuthorById(env, id)) as Author;

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return badRequest("Failed to fetch Author", 500);
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
    const data = await deleteAuthor(env, id);
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return badRequest("Failed to delete Author", 500);
  }
});

export default router;
