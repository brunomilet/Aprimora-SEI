#Criador de Processos com Documentos em PDF no SEI

##Rodar esses comandos na raiz do projeto
 - mkdir pdfs ###Onde deverão ser colocados os arquivos
 - npm init -y na raiz do projeto
 - npm install soap dotenv csv-parser


##Exemplo de .env

# URL do WS-SEI de Apresentação
SEI_WSDL_URL=https://servidor_do_sei/sei/controlador_ws.php?servico=sei
# Sigla do Sistema criado no SEI
SEI_SIGLA_SISTEMA=SIGLA_SISTEMA
# Sigla do Serviço criado no Sistema criado no SEI
SEI_SERVICO=SIGLA_SERVIÇO
# ID da UNIDADE "SEI" onde serão criados os processos
SEI_ID_UNIDADE=110000944
# ID do Tipo de Processo a serem criados
SEI_ID_TIPO_PROCESSO=100000724
# ID do Tipo de Documento a serem criados
SEI_ID_TIPO_DOCUMENTO=316
# Pasta onde os arquivos que vão pro SEI estão armazenados
PASTA_ARQUIVOS=
# Caminho Completo do o arquivo CSV para o SEI
CAMINHO_CSV=./teste.csv