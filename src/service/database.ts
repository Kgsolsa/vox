/** Database functions for querying tables */

import { Context } from "hono";
import { ulid } from "ulid";
import { Author, AuthorComment } from "../types";

/**
 * Executes a database query with the provided parameters.
 * @param env Hono context environment containing the database connection
 * @param query SQL query string to be executed
 * @param params Array of parameters to bind to the query
 * @returns
 */
export const executeDatabaseQuery = async (env: any, query: string, params: any[] = []): Promise<any[]> => {
  try {
    const data = (
      await env.DB.prepare(query)
        .bind(...params)
        .all()
    ).results;
    return data;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to execute database query");
  }
};

/**
 * Fetches all authors from the database.
 * @param env Hono context environment containing the database connection
 * @returns {Promise<Author[]>} Array of authors
 */
export const listAuthors = async (env: any) => {
  try {
    return (await executeDatabaseQuery(env, "SELECT * FROM authors")) as Author[];
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch Authors");
  }
};

/**
 * Fetches a specific author by ID from the database.
 * @param env Hono context environment containing the database connection
 * @param id Author ID to fetch
 * @returns {Promise<Author>} Author object
 */
export const getAuthorById = async (env: any, id: string): Promise<Author> => {
  try {
    return (await executeDatabaseQuery(env, "SELECT * FROM authors WHERE id = ?", [id]))[0];
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch Author");
  }
};

/**
 * Inserts a new author into the database.
 * @param env Hono context environment containing the database connection
 * @param author Author object to insert
 * @returns {Promise<Author>} Inserted author object
 */
export const insertAuthor = async (env: any, author: Author): Promise<Author> => {
  try {
    const id = ulid();

    await env.DB.prepare("INSERT INTO authors (id, name, email, external_id) VALUES (?, ?, ?, ?)")
      .bind(id, author.name, author.email, author.external_id ?? null)
      .run();

    return { ...author, id };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create Author");
  }
};

/**
 * Deletes an author by ID from the database.
 * @param env Hono context environment containing the database connection
 * @param id Author ID to delete
 * @returns {Promise<void>} Promise indicating completion of deletion
 */
export const deleteAuthor = async (env: any, id: string): Promise<void> => {
  try {
    await executeDatabaseQuery(env, "DELETE FROM authors WHERE id = ?", [id]);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete Author");
  }
};

/**
 * Fetches all comments from the database, optionally filtered by author_id, page_id, or comment_id.
 * @param env Hono context environment containing the database connection
 * @param author_id Optional author ID to filter comments
 * @param page_id Optional page ID to filter comments
 * @param comment_id Optional comment ID to filter comments
 * @returns {Promise<AuthorComment[]>} Array of comments with associated authors
 */
export const listComments = async (env: any, author_id?: string, page_id?: string, comment_id?: string, limit?: string, offset?: string) => {
  try {
    let query = "SELECT * FROM comments WHERE 1=1";
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

    if (limit) {
      query += " LIMIT ?";
      params.push(limit);
    }

    if (offset) {
      query += " OFFSET ?";
      params.push(offset);
    }

    const comments = (await executeDatabaseQuery(env, query, params)) as AuthorComment[];

    // Fetch authors by id
    const authorIds = comments.map(comment => comment.author_id).filter((value, index, self) => self.indexOf(value) === index);

    let authorsMap: Record<string, any> = {};
    if (authorIds.length > 0) {
      const placeholders = authorIds.map(() => "?").join(",");
      const authorsQuery = `SELECT * FROM authors WHERE id IN (${placeholders})`;
      const authors = await env.DB.prepare(authorsQuery)
        .bind(...authorIds)
        .all();

      authorsMap = Object.fromEntries(authors.results.map((author: Author) => [author.id, author]));
    }

    const commentsWithAuthors = comments.map(comment => ({
      ...comment,
      author: authorsMap[comment.author_id] || null, // Attach author object
    }));

    return commentsWithAuthors;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch Comments");
  }
};

/**
 * Fetches a specific comment by ID from the database.
 * @param env Hono context environment containing the database connection
 * @param id Comment ID to fetch
 * @returns {Promise<AuthorComment>} Comment object with associated author
 */
export const getCommentById = async (env: any, id: string): Promise<AuthorComment> => {
  try {
    let comment = (await executeDatabaseQuery(env, "SELECT * FROM comments WHERE id = ?", [id]))[0];

    if (!comment) {
      throw new Error("Comment not found");
    }

    // Fetch author by id
    const author = await getAuthorById(env, comment.author_id);

    if (!author) {
      throw new Error("Author not found");
    }

    // Attach author object to comment
    comment.author = author;

    return comment;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch Comment");
  }
};

/**
 * Inserts a new comment into the database.
 * @param env Hono context environment containing the database connection
 * @param comment Comment object to insert
 * @returns {Promise<AuthorComment>} Inserted comment object
 */
export const insertComment = async (env: any, comment: AuthorComment): Promise<AuthorComment> => {
  try {
    const id = ulid();

    let data = {
      id: id,
      author_id: comment.author_id,
      content: comment.content,
      comment_id: comment.comment_id ?? "",
      page_id: comment.page_id,
    };

    await env.DB.prepare("INSERT INTO comments (id, author_id, content, comment_id, page_id) VALUES (?, ?, ?, ?, ?)")
      .bind(id, comment.author_id, comment.content, comment.comment_id ?? null, comment.page_id)
      .run();

    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create Comment");
  }
};

/**
 * Deletes a comment by ID from the database.
 * @param env Hono context environment containing the database connection
 * @param id Comment ID to delete
 * @returns {Promise<void>} Promise indicating completion of deletion
 */
export const deleteComment = async (env: any, id: string): Promise<void> => {
  try {
    await executeDatabaseQuery(env, "DELETE FROM comments WHERE id = ?", [id]);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete Comment");
  }
};
