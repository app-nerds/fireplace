BEGIN;

-- 
-- Member Statuses
--
CREATE TABLE IF NOT EXISTS public.member_statuses (
	id serial,
	status character varying NOT NULL,
	PRIMARY KEY(id)
);

INSERT INTO public.member_statuses (id, status) VALUES
(1, 'Pending Approval'),
(2, 'Active'),
(3, 'Inactive')
;

--
-- Member Roles
--
CREATE TABLE IF NOT EXISTS public.member_roles (
  id serial,
  created_at timestamp without time zone NOT NULL,
	updated_at timestamp without time zone,
	deleted_at timestamp without time zone,
  color character varying NOT NULL,
  role character varying NOT NULL,
  PRIMARY KEY(id)
);

INSERT INTO public.member_roles (
  id,
  created_at,
  color,
  role
) VALUES
  (1, now(), '#F83F18', 'Admin'),
  (2, now(), '#1918F8', 'Member')
;

--
-- Members
--
CREATE TABLE IF NOT EXISTS public.members (
	id character varying NOT NULL,
	created_at timestamp without time zone NOT NULL,
	updated_at timestamp without time zone,
	deleted_at timestamp without time zone,
  avatar_url character varying NOT NULL,
  email character varying NOT NULL,
  external_id character varying NOT NULL,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  password character varying NOT NULL,
  role_id bigint references public.member_roles(id),
  status_id bigint references public.member_statuses(id),
  PRIMARY KEY(id)
);

CREATE INDEX idx_member_email ON public.members (email);

COMMIT;

