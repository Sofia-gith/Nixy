import express from "express"
import cors from "cors"
import bodyParser from "body-parser";
import session from "express-session";
import routes from "./routes/routes.js";

const app = express()
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'seu_segredo_aqui',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  
}));

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
  res.render("index", { user: req.session.user, usuarioNome: "usuario_nome", mostrarMenu: true });
});



app.get("/agenda", (req, res) => {
  res.render("agenda", {  user: req.session.user,usuarioNome: "usuario_nome", mostrarMenu: true });
});

app.get("/estatisticas", (req, res) => {
  res.render("estatisticas", { user: req.session.user, usuarioNome: "usuario_nome", mostrarMenu: true });
});

app.get("/anotacoes", (req, res) => {
  res.render("anotacoes", {  user: req.session.user,usuarioNome: "usuario_nome", mostrarMenu: true });
});

app.get("/pomodoro", (req, res) => {
  res.render("pomodoro", {  user: req.session.user,usuarioNome: "usuario_nome", mostrarMenu: true });
});

app.get('/login', (req, res) => {
  res.render('login', {
    mostrarMenu: false,
    error: null,
    email: "",
    nome: "" 
  });
});

app.get('/esqueciAsenha', (req, res) => {
  res.render('esqueciAsenha', {
    mostrarMenu: false,
    error: null,
    email: "",
    nome: "" 
  });
});

app.get('/cadastro', (req, res) => {
  res.status(200).render('cadastro', { 
    mostrarMenu: false,
    nome: '',
    email: '',
    error: null
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/cadastro', (req, res) => {
  res.status(200).render('cadastro', { mostrarMenu: false });
});

app.get('/landingPage', (req, res) => {
  res.status(200).render('landingPage', { mostrarMenu: false });
});


app.use(routes); 

app.listen(8080, () => {
  console.log("rodando na porta 8080")
})