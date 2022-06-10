const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

const data = require("./src/data.json");
const db = require("./src/" + data.database);

module.exports = {
  
  postProcessarVoto: async (request, reply) => {
  // Se a requisição NÃO veio com o parâmetro 'raw', vamos repassar o objeto SEO 
  // (Search Engine Optimization) que coloca dados nas tags META do arquivo hbs
  let params = request.query.raw ? {} : { seo: seo };

  // Flag para indicar que queremos mostrar os resultados da votação ao invés do formulário de votação
  params.verResultados = true;
  let votos;

  // Se tivermos um voto, enviaremos para o DAO para processá-lo e para obtermos os resultados
  if (request.body.linguagem) {
    votos = await db.processarVoto(request.body.linguagem);
    // O método processarVoto retorna os resultados presentes no Banco de Dados. 
    // Montamos uma lista com as linguagens e com os votos obtidos
    if (votos) {
      params.linguagens = votos.map(item => item.nome);
      params.totais = votos.map(item => item.numVotos);
    }
  }
  params.error = votos ? null : data.msgErro;

  // Se a requisição veio com o parâmetro 'raw', devolvo o JSON com o conteúdo dos votos. 
  // Se não, solicito a renderização da página index.hbs
  request.query.raw
    ? reply.send(params)
    : reply.view("/src/pages/index.hbs", params);  
  }
};