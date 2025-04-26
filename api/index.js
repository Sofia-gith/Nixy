import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";
import routes from "./routes/routes.js";
import { db } from './db.js';
import postagemRoutes from './routes/postagen.js'; 

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

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
  res.render("agenda", { user: req.session.user, usuarioNome: "usuario_nome", mostrarMenu: true });
});

app.get("/estatisticas", (req, res) => {
  res.render("estatisticas", { user: req.session.user, usuarioNome: "usuario_nome", mostrarMenu: true });
});

app.get("/anotacoes", (req, res) => {
  res.render("anotacoes", { user: req.session.user, usuarioNome: "usuario_nome", mostrarMenu: true });
});

app.get("/pomodoro", (req, res) => {
  res.render("pomodoro", { user: req.session.user, usuarioNome: "usuario_nome", mostrarMenu: true });
});

app.get('/usuario', async (req, res) => {
  const usuarioLogado = req.session.user;

  if (!usuarioLogado) {
    return res.redirect("/login");
  }

  try {
    const [rows] = await db.query("SELECT * FROM USUARIO_T01 WHERE ID_USUARIO_T01 = ?", [usuarioLogado.ID_USUARIO_T01]);

    if (rows.length === 0) {
      return res.status(404).send("Usuário não encontrado");
    }

    const user = rows[0];

    res.render("usuario", { user });
  } catch (err) {
    console.error("Erro ao carregar usuário:", err);
    res.status(500).send("Erro ao carregar a página.");
  }
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

app.get('/landingPage', (req, res) => {
  res.status(200).render('landingPage', { mostrarMenu: false });
});

app.use(routes);

// Adicionando as rotas de postagem
app.use('/api/postagen', postagemRoutes); 

app.listen(8080, () => {
  console.log("Rodando na porta 8080");
});
