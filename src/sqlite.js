/**
 * Módulo para manipular o banco de dados SQLite da votação
 */

// Para acesso ao FileSystem
const fs = require("fs");

// Inicialização do Banco de Dados
const dbFile = "./.data/votos.db";
const dbExiste = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");
let db;

// Solicitando a abertura do Banco de Dados
sqlite.open({ filename: dbFile, driver: sqlite3.Database})
  .then(async dBase => {
    db = dBase;
    try {
      if (!dbExiste) {
        // Se o banco de dados não existe, ele será criado. Criando a tabela Voto
        await db.run(
          "CREATE TABLE Linguagem (id INTEGER PRIMARY KEY AUTOINCREMENT, nome VARCHAR[20], numVotos INTEGER)"
        );

        // Adiciono quais são as linguagens da votação
        await db.run(
          "INSERT INTO Linguagem (nome, numVotos) VALUES ('Python', 0), ('JavaScript', 0), ('Java', 0), ('C#', 0)"
        );

        // Criando a tabela Log
        await db.run(
          "CREATE TABLE Log (id INTEGER PRIMARY KEY AUTOINCREMENT, hora STRING, idLinguagem INTEGER, FOREIGN KEY (idLinguagem) REFERENCES Linguagem(id))"
        );
      } else {
        // Se já temos um banco de dados, lista os votos processados
        console.log(await db.all("SELECT * from Linguagem"));
      }
    } catch (dbError) {
      console.error(dbError);
    }
  });

module.exports = {
// Funções disponibilizadas pela exportação
  //--- Retorna o resultado atual da votação ---//
  obterVotos: async () => {
    try {
      return await db.all("SELECT * from Linguagem");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  //--- processar novo voto ---//
  processarVoto: async (votoLinguagem) => {
    try {
      // verificando se o voto é válido
      const resultado = await db.all("SELECT * from Linguagem WHERE id = ?", votoLinguagem);
      if (resultado.length > 0) {
        await db.run("INSERT INTO Log (idLinguagem, hora) VALUES (?, ?)", 
                     [votoLinguagem, new Date().toISOString()]);
        await db.run(
          "UPDATE Linguagem SET numVotos = numVotos + 1 WHERE id = ?", votoLinguagem);
      }
      // Retorna o resultado atual da votação
      return await db.all("SELECT * from Linguagem");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  //--- Retorna os últimos logs da votação  ---//
  obterLogs: async () => {
    // Retorna os 30 logs mais recentes
    try {
      return await db.all("SELECT l.id, l.hora, l.idLinguagem, v.nome from Log l INNER JOIN Linguagem v ON l.idLinguagem = v.id ORDER BY hora DESC LIMIT 30");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  //--- Limpa os logs e reset os votos ---//
  limparLogs: async () => {
    try {
      await db.run("DELETE from Log");
      await db.run("DELETE from Linguagem");
      await db.run(
          "INSERT INTO Linguagem (nome, numVotos) VALUES ('Python', 0), ('JavaScript', 0), ('Java', 0), ('C#', 0)"
      );
      return [];
    } catch (dbError) {
      console.error(dbError);
    }
  },

  //--- Inclui uma nova linguagem na votação ---//
  incluirLinguagem: async (nome) => {
    try {
      await db.run("INSERT INTO Linguagem (nome, numVotos) VALUES (?, 0)", nome);
      return true;
    } catch (dbError) {
      console.error(dbError);
    }
  }

}
