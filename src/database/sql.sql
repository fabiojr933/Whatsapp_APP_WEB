CREATE TABLE public.empresa
(
  id serial,
  nome_empresa character varying(120) NOT NULL,
  cnpj character varying(120) NOT NULL,
  email character varying(120) NOT NULL,
  senha character varying(50) NOT NULL,
  servidor character varying(50) NOT NULL,
  apitoken character varying(50) NOT NULL,
  session character varying(50) NOT NULL,
  webhook character varying(255),
  via_importacao character varying(10),
  via_banco_dados character varying(10),
  ip character varying(120),
  dias_falta character varying(10)
)

CREATE TABLE public.cobranca
(
  id serial,
  codigo_empresa character varying(10),
  cliente character varying(10),
  valor_pendente character varying(15),
  nome_cliente character varying(100),
  telefone character varying(15),
  empresa character varying(100),
  codigo_cobranca integer
)

CREATE TABLE public.contato
(
  id serial,
  nome character varying(100),
  telefone character varying(100),
  empresa_cnpj character varying(50)
)


CREATE TABLE public.imagem
(
  id serial,
  codigo_mensagem integer,
  caminho_imagem text,
  telefone character varying(50)
)


CREATE TABLE public.licenca
(
  id serial,
  data_inicial date,
  data_final date,
  liberado character varying(20),
  id_empresa integer
)

CREATE TABLE public.mensagem
(
  id serial,
  codigo_mensagem integer,
  codigo_cliente character varying(25),
  cliente character varying(95),
  telefone character varying(20),
  mensagem text NOT NULL,
  empresa character varying(100) NOT NULL,
  imagem text
)




/*  sql para relatorio

select first 10 A.NOME, '6699539490' as FONE, 'fox sistemas' as EMPRESA, A.CODIGO, A.CPFCNPJ

from TRECCLIENTEGERAL A
where A.NOME is not null and
      A.FONE > '1' and
      substring(A.FONE from 1 for 3) = '669' and
      char_length(A.FONE) = '10'

ALTER TABLE contato ALTER COLUMN telefone TYPE numeric(10,0) USING telefone::numeric;


 imageToBase64(image).then((image64) =>{
          image64 = JSON.stringify(image64);
        }).catch((erro) => {
          console.log(erro);
        })  

*/

















/**
select
PAR.EMPRESA,
PAR.CLIENTE,
sum(PAR.VALORPENDENTE) as VALORPENDENTE,
CLG.NOME as NOMECLIENTE,
'6699539490' as FONE,
--CLG.FONE,
EMP.NOMEFANTASIA as NOMEEMPRESA
from TRECPARCELA PAR
left outer join TRECDOCUMENTO DCT on (DCT.EMPRESA = PAR.EMPRESA and DCT.CLIENTE = PAR.CLIENTE and DCT.TIPO = PAR.TIPO and DCT.DOCUMENTO = PAR.DOCUMENTO)
left outer join TRECTIPODOCUMENTO TIP on (TIP.CODIGO = DCT.TIPO)
left outer join TRECBAIXA BXA on (BXA.EMPRESA = PAR.EMPRESA and BXA.CLIENTE = PAR.CLIENTE and BXA.TIPO = PAR.TIPO and BXA.DOCUMENTO = PAR.DOCUMENTO and BXA.PARCELA = PAR.PARCELA)
left outer join TVENPEDIDO PED on (PED.EMPRESA = PAR.EMPRESA and PED.CODIGO = PAR.DOCUMENTO and PED.CLIENTE = PAR.CLIENTE)
left outer join TRECPORTADOR POR on (POR.CODIGO = PAR.PORTADOR)
left outer join TESTNATUREZA NAT on (NAT.CODIGO = PED.TIPOOPERACAO)
left outer join TRECCLIENTE CLI on (CLI.EMPRESA = DCT.EMPRESA and CLI.CODIGO = DCT.CLIENTE)
left outer join TRECCLIENTEGERAL CLG on (CLG.CODIGO = DCT.CLIENTE)
left outer join TRECTIPOCLIENTE TCL on (TCL.COD_TIPO = CLG.TIPOCLIENTE)
left outer join TGERCIDADE CID on (CID.CODIGO = CLG.CIDADE)
left outer join TGERESTADO EST on (EST.ESTADO = CID.ESTADO)
left outer join TGERVALORINDICE IND1 on (IND1.INDICE = DCT.INDICE and IND1.DATA = current_date)
left outer join TGERVALORINDICE IND2 on (IND2.INDICE = DCT.INDICE and IND2.DATA = PAR.VENCIMENTO)
left outer join TESTCONDPAGVENDA CON on (CON.CODIGO = PED.CONDICAOPAGTO and CON.EMPRESA = PED.EMPRESA)
left outer join TGEREMPRESA EMP on (EMP.CODIGO = PAR.EMPRESA)
inner join TRECREGIAO REC on (REC.CODIGO = CLG.REGIAO)
where PAR.IDRENEGOCIACAO is null and
      PAR.SITUACAO <> 'A' and
      PAR.DATABAIXA is null and
      PAR.VENCIMENTO between :DATAINICIAL and :DATAFINAL and
      not exists(select distinct TESTCONDPAGVENDA.ADMINISTRADORA
                 from TESTCONDPAGVENDA
                 where TESTCONDPAGVENDA.FORMA = 'AD' and
                       TESTCONDPAGVENDA.ADMINISTRADORA = CLI.CODIGO) and
      CLI.ATIVO = 'S' and
      PAR.EMPRESA = :EMPRESA and
      PAR.IDDESCONTO is null
      group by 1,2,4,5,6



*/