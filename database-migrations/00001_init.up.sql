BEGIN;

CREATE TABLE IF NOT EXISTS public.servers (
  id serial,
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone,
  deleted_at timestamp without time zone,
	description text,
	password character varying not null,
	server_name character varying not null,
	url character varying not null,
  member_id character varying NOT NULL,
  PRIMARY KEY (id)
);

COMMIT;
