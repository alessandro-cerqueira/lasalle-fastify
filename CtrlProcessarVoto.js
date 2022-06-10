const seo = require("./src/seo.json");
const data = require("./src/data.json");
const db = require("./src/" + data.database);

module.exports = {
  
  configurar: async(servidor) => {
    // Apresenta o formulário caso o path seja / e requisição via get
    servidor.get("/", module.exports.apresentarFormulario);

    // Apresenta o resultado da votação caso o path seja / e a requisição seja post
    servidor.post("/", module.exports.processarVoto);
  },
  
  apresentarFormulario: async (request, reply) => {
    // Se a requisição NÃO veio com o parâmetro 'raw', vamos repassar o objeto SEO
    // (Search Engine Optimization) que coloca dados nas tags META do arquivo hbs
    let params = request.query.raw ? {} : { seo: seo };

    // Recuperando os votos do banco de dados.
    // Montamos uma lista com as linguagens e com os votos obtidos
    const votos = await db.obterVotos();
    if (votos) 
      params.votos = votos;
    // Se não obteve os votos, repassar a mensagem de erro.
    else params.error = data.msgErro;

    // Se o array de linguagens está vazio
    if (votos && params.votos.length < 1) 
      params.setup = data.msgSetup;

    // Se a requisição veio com o parâmetro 'raw', devolvo o JSON com o conteúdo dos votos.
    // Se não, solicito a renderização da página index.hbs
    request.query.raw ? reply.send(params) : reply.view("/src/pages/index.hbs", params);
  },

  processarVoto: async (request, reply) => {
    // Se a requisição NÃO veio com o parâmetro 'raw', vamos repassar o objeto SEO
    // (Search Engine Optimization) que coloca dados nas tags META do arquivo hbs
    let params = request.query.raw ? {} : { seo: seo };

    // Adicionando voto à linguagem indicada
    await db.processarVoto(request.body.idLinguagem);
    
    const ctrlVisualizarApuracao = require("./CtrlVisualizarApuracao.js");
    await ctrlVisualizarApuracao.apresentarResultados(request,reply);

  },

  //---------------------------------------------------------------------//
};
