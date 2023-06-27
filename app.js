const express = require("express");
const app = express();
const handlebars = require("express-handlebars").engine;
const bodyParser = require("body-parser");
const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");

const serviceAccount = require("./projectweb-7485d-firebase-adminsdk-r5v0v-c7048c4b19.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.render("primeira_pagina");
});

app.get("/consulta", function (req, res) {
  db.collection("agendamentos")
    .get()
    .then((snapshot) => {
      const agendamentos = [];
      snapshot.forEach((doc) => {
        agendamentos.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      res.render("consulta", { agendamentos });
    })
    .catch((error) => {
      console.log("Erro ao obter agendamentos: ", error);
      res.render("consulta", { agendamentos: [] });
    });
});

app.get("/editar/:id", function (req, res) {
  const id = req.params.id;
  db.collection("agendamentos")
    .doc(id)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const agendamentos = {
          id: doc.id,
          ...doc.data(),
        };
        res.render("editar", { agendamentos });
      } else {
        res.redirect("/consulta");
      }
    })
    .catch((error) => {
      console.log("Erro ao obter agendamento: ", error);
      res.redirect("/consulta");
    });
});

app.get("/excluir/:id", function (req, res) {
  const id = req.params.id;
  db.collection("agendamentos")
    .doc(id)
    .delete()
    .then(() => {
      console.log("Agendamento excluído com sucesso!");
      res.redirect("/consulta");
    })
    .catch((error) => {
      console.log("Erro ao excluir agendamento: ", error);
      res.redirect("/consulta");
    });
});

app.post("/cadastrar", function (req, res) {
  var result = db
    .collection("agendamentos")
    .add({
      nome: req.body.nome,
      telefone: req.body.telefone,
      origem: req.body.origem,
      data_contato: req.body.data_contato,
      observacao: req.body.observacao,
    })
    .then(function () {
      console.log("Agendamento cadastrado com sucesso!");
      res.redirect("/consulta");
    });
});

app.post("/atualizar", function (req, res) {
  const id = req.body.id;
  const agendamentoRef = db.collection("agendamentos").doc(id);
  const updateData = {
    nome: req.body.nome,
    telefone: req.body.telefone,
    origem: req.body.origem,
    data_contato: req.body.data_contato,
    observacao: req.body.observacao,
  };

  agendamentoRef
    .update(updateData)
    .then(() => {
      console.log("Agendamento atualizado com sucesso!");
      res.redirect("/consulta");
    })
    .catch((error) => {
      console.log("Erro ao atualizar agendamento: ", error);
      res.redirect("/consulta");
    });
});

app.listen(8081, function () {
  console.log("Servidor ativo!");
});
