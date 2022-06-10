const seo = require("./src/seo.json");
const data = require("./src/data.json");
const db = require("./src/" + data.database);

module.exports = {
    configurar: async(servidor) => {
      // Apresenta o resultado da votação caso o path seja / e a requisição seja post
      servidor.get("/resultado", module.exports.apresentarResultados);
  },
  
  apresentarResultados: async (request, reply) => {
    // Se a requisição NÃO veio com o parâmetro 'raw', vamos repassar o objeto SEO
    // (Search Engine Optimization) que coloca dados nas tags META do arquivo hbs
    let params = request.query.raw ? {} : { seo: seo };

    // Indicamos que queremos ver os resultados.
    params.verResultados = true;
    // Recuperando os votos do banco de dados.
    // Montamos uma lista com as linguagens e com os votos obtidos
    const votos = await db.obterVotos();
    if (votos) 
      params.votos = votos;
    // Se não obteve os votos, repassar a mensagem de erro.
    else params.error = data.msgErro;

    // Se a requisição veio com o parâmetro 'raw', devolvo o JSON com o conteúdo dos votos.
    // Se não, solicito a renderização da página index.hbs
    reply.view("/src/pages/index.hbs", params);
  },
};
