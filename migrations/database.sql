DROP TABLE IF EXISTS comments_likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS authors;

CREATE TABLE authors (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    external_id VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id VARCHAR(100) PRIMARY KEY,
    page_id INT NOT NULL,
    author_id VARCHAR(100) NOT NULL,
    comment_id VARCHAR(100) DEFAULT NULL,
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES authors(id),
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE comments_likes (
    id VARCHAR(100) PRIMARY KEY,
    author_id VARCHAR(100) NOT NULL,
    comment_id VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (comment_id, author_id),
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE, -- Likes removed if comment is deleted
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE -- Likes removed if author is deleted
);
