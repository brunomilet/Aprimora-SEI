# Criador de Processos com Documentos em PDF no SEI

Hoje o projeto visa atender uma demanda prática do TRF2 que é migrar uma série de documentos do servidor de arquivos para o SEI.
Então esse programa simples em Node.js utiliza a API oficial do SEI para criar processos já com documentos externos (PDF) na árvore e no final coloca uma atualização no andamento do processo para marcar que a migração daquele processo foi finalizada.

# Rodar esses comandos na raiz do projeto
 - npm init -y na raiz do projeto
 - npm install soap dotenv csv-parser

# Exemplo de .env

#URL do WS-SEI de Apresentação
  SEI_WSDL_URL=https://[servidor_do_sei]/sei/controlador_ws.php?servico=sei
#Sigla do Sistema criado no SEI
  SEI_SIGLA_SISTEMA=SIGLA_SISTEMA
#Sigla do Serviço criado no Sistema criado no SEI
  SEI_SERVICO=SIGLA_SERVIÇO
#ID da UNIDADE "SEI" onde serão criados os processos
  SEI_ID_UNIDADE=110000944
#ID do Tipo de Processo a serem criados
  SEI_ID_TIPO_PROCESSO=100000724
#ID do Tipo de Documento a serem criados
  SEI_ID_TIPO_DOCUMENTO=316
#Pasta onde os arquivos que vão pro SEI estão armazenados
  PASTA_ARQUIVOS=[caminho completo dos arquivos]
#Caminho Completo do o arquivo CSV para o SEI
  CAMINHO_CSV=./teste.csv
