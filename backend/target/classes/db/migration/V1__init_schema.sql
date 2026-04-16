CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE team_members (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    team_id BIGINT NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL,
    UNIQUE (user_id, team_id)
);

CREATE INDEX idx_team_members_user ON team_members (user_id);
CREATE INDEX idx_team_members_team ON team_members (team_id);

CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    team_id BIGINT NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
    created_by BIGINT NOT NULL REFERENCES users (id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_projects_team ON projects (team_id);

CREATE TABLE folders (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    project_id BIGINT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    parent_folder_id BIGINT REFERENCES folders (id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_folders_project ON folders (project_id);
CREATE INDEX idx_folders_parent ON folders (parent_folder_id);

CREATE TABLE markdown_files (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    project_id BIGINT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    folder_id BIGINT NOT NULL REFERENCES folders (id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by BIGINT NOT NULL REFERENCES users (id),
    updated_by BIGINT NOT NULL REFERENCES users (id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_markdown_files_folder ON markdown_files (folder_id);
CREATE INDEX idx_markdown_files_project ON markdown_files (project_id);
CREATE INDEX idx_markdown_files_name_lower ON markdown_files (LOWER(name));
