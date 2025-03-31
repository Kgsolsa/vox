//
export interface Author {
  id: string;
  name: string;
  email: string;
  external_id?: string;
}

export interface AuthorComment {
  id: string;
  author_id: string;
  content: string;
  page_id: string;
  comment_id?: string;
}
