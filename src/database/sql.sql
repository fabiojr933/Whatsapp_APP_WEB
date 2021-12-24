CREATE TABLE public.empresa
(
  id serial,
  nome_empresa character varying(120) NOT NULL,
  cnpj character varying(120) NOT NULL,
  email character varying(120) NOT NULL,
  senha character varying(50) NOT NULL,
  SERVIDOR varchar(50) not null,
  apitoken varchar(50) not null,
  session varchar(50) not null,
  webhook varchar(255),
  via_importacao varchar(10),
  via_banco_dados varchar(10)
)