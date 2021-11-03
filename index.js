const express = require("express");
const mongo = require("mongodb");
const dotenv = require('dotenv').config();
const fs = require('fs');

const app = express();

const DB_CLIENT = new mongo.MongoClient(process.env.MONGO_DB_URI);

async function connectToDb(){
    await DB_CLIENT.connect();
}
async function populateDb(alunosObject) {
    await DB_CLIENT.db().createCollection('alunos');

    alunosObject.forEach(aluno => async () => {
        await DB_CLIENT.db().collection('alunos').insertOne(aluno);
    });
}

async function main(){
    let alunos;

    try {
        await connectToDb();
    } catch (error) {
        console.log("Falha na conexão com o MongoDB");
        throw error;
    }

    try {
        const alunosFile = fs.readFileSync(process.env.DB_INITIAL_DATA, 'utf-8');
        alunos = JSON.parse(alunosFile);
    } catch (error) {
        console.log("Falha ao ler o arquivo de dados.");
        throw error;
    }

    try {
        await populateDb(alunos);
    } catch (error) {
        console.log("Falha ao popular o banco de dados.");
        throw error;
    }

}

app.get("/aluno", async (req, res )=> {

    let alunos_response;

    try {
        alunos_response = await DB_CLIENT.db().collection('alunos').find({}).toArray();
    } catch (error) {
        alunos_response = {"Error": "Falha na conexão com o banco de dados."};
    }
    res.send(alunos_response);
}) ;

app.get("/professores", (req, res )=> {
    let professores  = [ {
                    nome: "David Reis",
                    disciplina : "Topicos Especiais",
                    curso : "ADS"
    },
    {
        nome: "Alexandre Oliveira Garcia ",
        disciplina : "O danado do HASKELL",
        curso : "ADS"
}]
    res.send(professores);
}) ;


app.listen(3000, async () => {
    try {
        await main();
        console.log("API funcionando!");
    } catch (error) {
        console.log("Erro ao iniciar API.");
    }
})