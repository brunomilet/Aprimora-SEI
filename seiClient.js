require('dotenv').config();
const soap = require('soap');

async function createClient() {
  const client = await soap.createClientAsync(process.env.SEI_WSDL_URL);
  return client;
}

module.exports = createClient;