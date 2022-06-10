const seo = require("./src/seo.json");
const data = require("./src/data.json");
const db = require("./src/" + data.database);


module.exports = {
  
  configurar: async(servidor) => {
      // Resseta a votação caso o path seja /reset e a requisição seja post
      servidor.post("/reset", module.exports.reiniciarVotacao );
  },
  
  reiniciarVotacao: async (request, reply) => {
    // Se a requisição NÃO veio com o parâmetro 'raw', vamos repassar o objeto SEO
    // (Search Engine Optimization) que coloca dados nas tags META do arquivo hbs
    let params = request.query.raw ? {} : { seo: seo };

    // Verificando se a autenticação foi realizada corretamente. 'process' é um
    // objeto que provê informações e controle sobre a execução do processo Node.js
    if (
      !request.body.key ||
      request.body.key.length < 1 ||
      !process.env.ADMIN_KEY ||
      request.body.key !== process.env.ADMIN_KEY
    ) {
      console.error("Falha na autenticação");

      // Define a mensagem de falha na autenticação
      params.falha = "As credenciais enviadas são inválidas!";

      // Obtem a lista de logs
      params.logs = await db.obterLogs();
    } else {
      // Solicita a limpeza dos logs.
      params.logs = await db.limparLogs();

      // Define a mensagem de erro, caso não tenha realizado a ação de limpeza com sucesso
      params.error = params.logs ? null : data.errorMessage;
    }

    // Envia o status 401 se a autenticação falhou. Se não, envia 200
    const status = params.failed ? 401 : 200;
    // Se a requisição veio com o parâmetro 'raw', devolvo o JSON com o conteúdo dos votos.
    // Se não, solicito a renderização da página admin.hbs
    request.query.raw
      ? reply.status(status).send(params)
      : reply.status(status).view("/src/pages/admin.hbs", params);
  },
};
