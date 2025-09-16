require('dotenv').config();
const createClient = require('./seiClient');
const fs = require('fs');
const csv = require('csv-parser');

const caminhoCSV = process.env.CAMINHO_CSV;
const pastaArquivosExternos = process.env.PASTA_ARQUIVOS; // Pasta onde os arquivos que vão pro SEI estão armazenados
const logFile = fs.createWriteStream((process.env.CAMINHO_LOG), { flags: 'a' });
const logError = fs.createWriteStream((process.env.CAMINHO_LOG_ERROS), { flags: 'a' });

const date = new Date();
date.setHours(date.getHours() - 3); // Horário de Brasília (UTC-3)

// Redefine o console.log para também escrever no arquivo
console.log = function (message) {
    logFile.write(`${date.toISOString()} - ${message}\n`); // Adiciona timestamp
    process.stdout.write(`${message}\n`); // Mantém o comportamento original do console.log
};
// Redefine o console.error para também escrever no arquivo
console.error = function (message) {  //log de erros escreve nos 2 arquivos
  logError.write(`${date.toISOString()} - ${message}\n`); // Adiciona timestamp
  logFile.write(`${date.toISOString()} - ${message}\n`); // Adiciona timestamp
  process.stderr.write(`${message}\n`); // Mantém o comportamento original do console.log
};

async function lerCsv(caminho) {
  return new Promise((resolve, reject) => {
    const resultados = [];
    fs.createReadStream(caminho)
      .pipe(csv({
        separator: ';',
        mapHeaders: ({ header }) => {
          // Remove BOM invisível do primeiro header, se presente
          return header.replace(/^\uFEFF/, '');
        }
      }))
      .on('data', (row) => resultados.push(row))
      .on('end', () => resolve(resultados))
      .on('error', reject);
  });
}

async function processar() {
  try {
    const linhas = await lerCsv(caminhoCSV);
  
    // Agrupar linhas por especificação (Nome)
    const processosMap = new Map();

    for (const linha of linhas) {
      const especificacao = linha.Nome || linha.nome;
      const nomeDocumento = linha.Arquivo || linha.arquivo;
      const pasta = linha.Pasta || linha.pasta;

      if (!especificacao || !nomeDocumento || !pasta) {
        console.error(`❗ Linha ignorada por dados incompletos: ${linha}`);
        continue;
      }

      if (!processosMap.has(especificacao)) {
        processosMap.set(especificacao, []);
      }

      processosMap.get(especificacao).push({ nomeDocumento, pasta });
    }

    // Agora, para cada grupo, cria um processo com todos os documentos
    for (const [especificacao, documentos] of processosMap.entries()) {
      console.log(`🌀 Processo: "${especificacao}" com ${documentos.length} documento(s)...`);
    
      try {
        const resultado = await criarProcesso(especificacao, documentos);
        const protocolo = resultado.parametros.ProcedimentoFormatado.$value;

        try {
          await lancarAndamento(protocolo, `Migração do ASF de ${especificacao} concluída.`);
        } catch (erro) {
          console.error(`❌ Erro ao lançar andamento para "${especificacao}".`);
        }

        console.log(`✅ Processo criado: "${protocolo}"`);
      } catch (erro) {
        console.error(`❌ Erro ao criar processo para "${especificacao}". Erro: ${erro.message}`);
      }
    }

    console.log('🏁 Todos os processos foram processados.');
  } catch (erro) {
    console.error('Erro durante o processamento.');
  }
}

processar();

async function criarProcesso(especificacao, documentosInfo) {
  const client = await createClient();

  const documentos = [];
  const docErro = false;

  for (const { pasta, nomeDocumento } of documentosInfo) {
    try {
      const caminho = `${pastaArquivosExternos}/${pasta}/${nomeDocumento}`;
      const conteudo = fs.readFileSync(caminho).toString('base64');

      documentos.push({
        Tipo: 'R',
        IdSerie: process.env.SEI_ID_TIPO_DOCUMENTO,
        Data: new Date().toLocaleDateString('pt-BR'),
        NomeArquivo: nomeDocumento,
        Conteudo: conteudo
      });
    } catch (erro) {
      console.error(`❌ Erro ao ler documento "${nomeDocumento}" da pasta "${pasta}".`);
      docErro = true;
      break; // Interrompe a leitura de documentos se houver erro
    }
  }

  const args = {
    SiglaSistema: process.env.SEI_SIGLA_SISTEMA,
    IdentificacaoServico: process.env.SEI_SERVICO,
    IdUnidade: process.env.SEI_ID_UNIDADE,
    Procedimento: {
      IdTipoProcedimento: process.env.SEI_ID_TIPO_PROCESSO,
      Especificacao: especificacao,
      NivelAcesso: 1,
      Interessados: {
        Interessado: [{ Nome: especificacao }]
      }
    },
    Documentos: {
      Documento: documentos
    }
  };
  if (docErro) {
    console.error(`❗ Não foi possível criar o ASF para "${especificacao}" devido a erros na leitura de documentos.`);
    return;
  } else if (documentos.length === 0) {
    console.error(`❗ Não foram encontrados documentos para "${especificacao}". Processo não será criado.`);
    return;
  } else if (documentos.length > 200) {
    console.error(`❗ O número de documentos para "${especificacao}" excede o limite de 200. Processo não será criado.`);
    return;
  } else {
    console.log(`📦 Enviando ${documentos.length} documento(s) para o SEI...`);
    const [res] = await client.gerarProcedimentoAsync(args);
    return res;
  }
}

async function lancarAndamento(protocolo, texto) {
  const client = await createClient();
  const args = {
    SiglaSistema: process.env.SEI_SIGLA_SISTEMA,
    IdentificacaoServico: process.env.SEI_SERVICO,
    IdUnidade: process.env.SEI_ID_UNIDADE,
    ProtocoloProcedimento: protocolo,
    IdTarefa: 65,
    Atributos: {
      AtributoAndamento: [
        {
          Nome: 'DESCRICAO',
          Valor: texto,
          IdOrigem: 65
        }
      ]
    }
  };
  const [res] = await client.lancarAndamentoAsync(args);
  console.log(`📝 Andamento lançado: ${res.parametros.Descricao.$value}`);
  return res;
}
