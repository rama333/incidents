CREATE TABLE incidents (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    reg_modified TIMESTAMP WITH TIME ZONE NOT NULL,
    long_name TEXT NOT NULL,
    node_name TEXT NOT NULL,
    lifecyclestate int NOT NULL,
    longitude TEXT NOT NULL,
    latitude TEXT NOT NULL,
    zone TEXT NOT NULL,
    services TEXT NOT NULL,
    addres TEXT NOT NULL
);



