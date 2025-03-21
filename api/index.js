import express from "express"
import cors from "cors"
const app = express()
app.use(express.static("public"));
app.use(express.json())
app.use(cors())

app.set('view engine', 'ejs');
app.set('views', './view');
app.use(express.static("public"));

const menuItems = [
  { nome: "Agenda", link: "/agenda" },
  { nome: "Minhas estatísticas", link: "/estatisticas" },
  { nome: "Anotações", link: "/anotacoes" },
  { nome: "Pomodoro", link: "/pomodoro" }
];

app.use((req, res, next) => {
  res.locals.menuItems = menuItems;
  next();
});

    app.get("/", (req, res) => { 
      res.render("index", { usuarioNome: "usuario_nome", mostrarMenu: true });
    });

  app.get("/agenda", (req, res) => { 
    res.render("agenda", { usuarioNome: "usuario_nome" }); 
  });
  
  app.get("/estatisticas", (req, res) => { 
    res.render("estatisticas", { usuarioNome: "usuario_nome", mostrarMenu: true });
  });
  
  app.get("/anotacoes", (req, res) => { 
    res.render("anotacoes", { usuarioNome: "usuario_nome", mostrarMenu: true });
  });
  
  app.get("/pomodoro", (req, res) => { 
    res.render("pomodoro", { usuarioNome: "usuario_nome", mostrarMenu: true }); 
  });

app.get('/login', (req, res) => {
    res.status(200).render('login', {mostrarMenu: false });
});

app.get('/cadastro', (req, res) => {
    res.status(200).render('cadastro', {mostrarMenu: false });
});

app.get('/landingPage', (req, res) => {
    res.status(200).render('landingPage', {mostrarMenu: false });
});

app.listen(8800, () => {
    console.log("rodando na porta 8800")
})