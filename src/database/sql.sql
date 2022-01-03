CREATE TABLE public.empresa
(
  id serial NOT NULL,
  nome_empresa character varying(120) NOT NULL,
  cnpj character varying(120) NOT NULL,
  email character varying(120) NOT NULL,
  senha character varying(50) NOT NULL,
  servidor character varying(50) NOT NULL,
  apitoken character varying(50) NOT NULL,
  session character varying(50) NOT NULL,
  webhook character varying(255),
  via_importacao character varying(10),
  via_banco_dados character varying(10)
);


CREATE TABLE public.mensagem
(
  id serial NOT NULL,
  codigo_mensagem integer,
  codigo_cliente character varying(25),
  cliente character varying(95),
  telefone character varying(20),
  mensagem text NOT NULL,
  empresa character varying(100) NOT NULL
);
CREATE TABLE public.contato
(
  id serial,
  nome character varying(100),
  telefone character varying(100),
  empresa_cnpj character varying(50)
);


/*  sql para relatorio

select first 10 A.NOME, '6699539490' as FONE, 'fox sistemas' as EMPRESA, A.CODIGO, A.CPFCNPJ

from TRECCLIENTEGERAL A
where A.NOME is not null and
      A.FONE > '1' and
      substring(A.FONE from 1 for 3) = '669' and
      char_length(A.FONE) = '10'

ALTER TABLE contato ALTER COLUMN telefone TYPE numeric(10,0) USING telefone::numeric;





CREATE TABLE public.mensagem
(
  id integer NOT NULL DEFAULT nextval('mensagem_id_seq'::regclass),
  codigo_mensagem integer,
  codigo_cliente character varying(25),
  cliente character varying(95),
  telefone character varying(20),
  mensagem text NOT NULL,
  empresa character varying(100) NOT NULL,
  usuario character varying(50),
  data date,
  CONSTRAINT mensagem_codigo_mensagem_key UNIQUE (codigo_mensagem)
)
CREATE TABLE public.image
(
  id integer NOT NULL DEFAULT nextval('image_id_seq'::regclass),
  id_codigo_mensagem integer,
  imagem text,
  CONSTRAINT image_pkey PRIMARY KEY (id),
  CONSTRAINT image_id_codigo_mensagem_fkey FOREIGN KEY (id_codigo_mensagem)
      REFERENCES public.mensagem (codigo_mensagem) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)

 imageToBase64(image).then((image64) =>{
          image64 = JSON.stringify(image64);
        }).catch((erro) => {
          console.log(erro);
        })  

*/