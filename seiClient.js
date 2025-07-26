require('dotenv').config();
const soap = require('soap');

async function createClient() {
  console.log('Criando cliente SOAP para SEI...');
  console.log('Conectando ao WSDL do SEI:', process.env.SEI_WSDL_URL);
  const client = await soap.createClientAsync(process.env.SEI_WSDL_URL);
  console.log('Cliente SOAP criado com sucesso');
  //client.addHttpHeader('Content-Type', 'text/xml;charset=UTF-8');
  //client.addHttpHeader('SOAPAction', '""');
  //console.erro('Erro ao criar cliente SOAP:', erro);
  return client;
}

module.exports = createClient;