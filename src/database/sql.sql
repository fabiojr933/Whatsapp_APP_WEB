-- Table: public.empresa

-- DROP TABLE public.empresa;

CREATE TABLE public.empresa
(
  id integer NOT NULL DEFAULT nextval('empresa_id_seq'::regclass),
  nome_empresa character varying(120) NOT NULL,
  cnpj character varying(120) NOT NULL,
  email character varying(120) NOT NULL,
  senha character varying(50) NOT NULL
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.empresa
  OWNER TO postgres;