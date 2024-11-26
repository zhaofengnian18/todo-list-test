-- 用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TODO列表表
CREATE TABLE todo_lists (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- TODO项目表
CREATE TABLE todo_items (
    id BIGINT PRIMARY KEY,
    list_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    score INTEGER NOT NULL,  -- 优先级分数
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- e.g., PENDING, COMPLETED, ARCHIVED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES todo_lists(id)
);

-- 创建索引以优化查询性能
CREATE INDEX idx_todo_items_score ON todo_items(score DESC);
CREATE INDEX idx_todo_items_list_id ON todo_items(list_id);
CREATE INDEX idx_todo_lists_user_id ON todo_lists(user_id);