'use strict'

// Para especificações de path 
const path = require("path");

// Para uso do Framework Fastify
const servidor = require("fastify")({
  logger: false //  Para visualizarmos o log do sistema
});

// Configurando o fastify para retornar os arquivos estáticos, como se fosse um servidor web simples
servidor.register(require("fastify-static"), {
  // Qual é a pasta que contém os arquivos estáticos
  root: path.join(__dirname, "public"),  
  // Prefixo para retornar os arquivos estáticos. 
  prefix: "/" 
});

// Configurando o Fastify para processar o input de dados vindos de formulários
servidor.register(require("fastify-formbody"));

const hbs = require("handlebars");
// Registrando o template manager Point-of-View
servidor.register(require("point-of-view"), {
  engine: {
    handlebars: hbs
  }
});

hbs.registerHelper('nomes', function (votos) {
  let tamanho = votos.length;
  let resultado = [];
  for(let i = 0; i < tamanho; i++)
    resultado.push(votos[i].nome);
  return resultado;
});

hbs.registerHelper('totais', function (votos) {
  let tamanho = votos.length;
  let resultado = [];
  for(let i = 0; i < tamanho; i++)
    resultado.push(votos[i].numVotos);
  
  return resultado;
});

// Processa a injeção de dependência colocada no arquivo .env 
// Realizo a carga dos controladores e chamo o método configurar.
const nomesCtrl = process.env.CONTROLADORES.split(',');
for(let i = 0; i < nomesCtrl.length; i++) {
  let ctrl = require("./" + nomesCtrl[i] + ".js");
  ctrl.configurar(servidor);
}
console.log(nomesCtrl);

// Colocando o servidor no ar 
servidor.listen(process.env.PORT, '0.0.0.0', function(err, address) {
  if (err) {
    servidor.log.error(err);
    process.exit(1);
  }
  console.log(`A aplicação está ouvindo em ${address}`);
  servidor.log.info('servidor ouvindo em ' + address);
});

//---------------------------------------------------------------------//

