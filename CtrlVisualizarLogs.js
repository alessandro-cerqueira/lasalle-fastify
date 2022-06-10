const seo = require("./src/seo.json");
const data = require("./src/data.json");
const db = require("./src/" + data.database);

module.exports = {
  configurar: async(servidor) => {
    // Apresenta os logs da votação caso o path seja /logs e a requisição seja get
    servidor.get("/logs", module.exports.visualizarLogs);
  },
  
  visualizarLogs: async (request, reply) => {
    // Se a requisição NÃO veio com o parâmetro 'raw', vamos repassar o objeto SEO
    // (Search Engine Optimization) que coloca dados nas tags META do arquivo hbs
    let params = request.query.raw ? {} : { seo: seo };

    // obtem a lista de logs
    params.logs = await db.obterLogs();

    // Recuperando a mensagem de erro, caso tenha ocorrido algo
    params.error = params.logs ? null : data.msgErro;

    // Se a requisição veio com o parâmetro 'raw', devolvo o JSON com o conteúdo dos votos.
    // Se não, solicito a renderização da página admin.hbs
    request.query.raw
      ? reply.send(params)
      : reply.view("/src/pages/admin.hbs", params);
  },
};
