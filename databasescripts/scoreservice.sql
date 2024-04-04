CREATE TABLE IF NOT EXISTS image_tags (
    id SERIAL PRIMARY KEY,
    target_id VARCHAR(255) NOT NULL,
    owner_id VARCHAR(255) NOT NULL,
    image_uuid UUID NOT NULL,
    tags JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS image_results (
    id SERIAL PRIMARY KEY,
    target_id VARCHAR(255) NOT NULL,
    image_uuid UUID NOT NULL,
    owner_id VARCHAR(255) NOT NULL,
    score DOUBLE PRECISION NOT NULL
);
