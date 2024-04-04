CREATE TABLE IF NOT EXISTS targets (
    id SERIAL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS image_tags (
    id SERIAL PRIMARY KEY,
    target_id INT NOT NULL,
    owner_id VARCHAR(255) NOT NULL,
    image_uuid UUID NOT NULL,
    tags JSON NOT NULL,
    FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS image_results (
    id SERIAL PRIMARY KEY,
    target_id INT NOT NULL,
    image_uuid UUID NOT NULL,
    owner_id VARCHAR(255) NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE
);
