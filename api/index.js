import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";
import routes from "./routes/routes.js";
import { db } from './db.js';
import postagemRoutes from './routes/postagen.js';
import anotacaoRoutes from './routes/anotacao.js';
import { ensureAuthenticated } from './middlewares/auth.js';
import bcrypt from 'bcrypt';
import pomodoroRoutes from './routes/pomodoro.js';
import upload from './middlewares/upload.js';


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

app.use(session({
  secret: 'seu_segredo_aqui',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use('/anotacoes', anotacaoRoutes);

app.set('view engine', 'ejs');
app.set('views', './view');
app.use('/pomodoro', pomodoroRoutes);



app.use((req, res, next) => {
  res.locals.menuItems = menuItems;
  next();
});

app.get('/usuario', async (req, res) => {
  const usuarioLogado = req.session.user;

  if (!usuarioLogado) {
    return res.redirect("/login");
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM usuario_t01 WHERE ID_USUARIO_T01 = ?",
      [usuarioLogado.ID_USUARIO_T01]
    );

    if (rows.length === 0) {
      return res.status(404).send("Usuário não encontrado");
    }

    const user = rows[0];

    res.render("usuario", {  usuario: user });
  } catch (err) {
    console.error("Erro ao carregar usuário:", err);
    res.status(500).send("Erro ao carregar a página.");
  }
});

app.get("/", (req, res) => {
  res.render("index", { user: req.session.user, usuarioNome: "usuario_nome", mostrarMenu: true });
});

app.get("/agenda", (req, res) => {
  const now = new Date();
  const { month, year } = req.query;

  const currentMonth = month ? parseInt(month) : now.getMonth();
  const currentYear = year ? parseInt(year) : now.getFullYear();

  // Lógica do calendário...
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= lastDate; d++) days.push(d);

  const isToday = (d) => {
    return (
      d === now.getDate() &&
      currentMonth === now.getMonth() &&
      currentYear === now.getFullYear()
    );
  };

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  res.render("agenda", {
    user: req.session.user,
    usuarioNome: "usuario_nome",
    mostrarMenu: true,
    month: currentMonth,
    year: currentYear,
    days,
    isToday,
    monthName: new Date(currentYear, currentMonth).toLocaleString("pt-BR", { month: "long" }),
    prevMonth,
    prevYear,
    nextMonth,
    nextYear
  });
});

app.get("/estatisticas", (req, res) => {
    // Simule dados, ou busque do banco
    const dados = {
      diasSeguidos: 10,
      horasEstudadas: 20,
      posts: 0,
      progressoHoras: 65,
      graficoBarras: [3, 1, 5],
      graficoBarras2: [2, 1, 4, 0.5, 3],
      calendario: gerarDiasDoMes(2025, 2), // Março = mês 2
    };
  
    res.render('estatisticas', {
      user: req.session.user,
      mostrarMenu: true,
      ...dados
    });
  });
  
  function gerarDiasDoMes(ano, mes) {
    const dias = [];
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    for (let i = 1; i <= totalDias; i++) {
      dias.push(i);
    }
    return dias;
  }
  

app.get("/anotacoes", (req, res) => {
  res.render("anotacoes", { user: req.session.user, usuarioNome: "usuario_nome", mostrarMenu: true });
});

app.get("/pomodoro", (req, res) => {
  res.render("pomodoro", { user: req.session.user, usuarioNome: "usuario_nome", mostrarMenu: true });
});

app.get('/login', (req, res) => {
  res.render('login', { mostrarMenu: false, error: null, email: '' });
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

app.post('/upload-foto/:id', upload.single('foto'), async (req, res) => {
  const { id } = req.params;
  const imagemUrl = req.file.path;

  try {
    await db.query('UPDATE USUARIO_T01 SET FOTO_PERFIL_URL = ? WHERE ID_USUARIO_T01 = ?', [imagemUrl, id]);

    req.session.user.FOTO_PERFIL_URL = imagemUrl;

    res.redirect('/usuario');
  } catch (err) {
    console.error("Erro ao atualizar foto de perfil:", err);
    res.status(500).send("Erro ao atualizar a foto.");
  }
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

//forúm

app.get("/Forum", (req, res) => {
  res.render("Forum", { mostrarMenu: false, 
    posts: [
      {
        forum: 'Estudos de Programação',
        titulo: 'Como programar?',
        conteudo: 'Você pode usar EJS para renderizar HTML dinâmico com JavaScript no servidor.'
      }
    ],
    comunidades: ['comunidade 1', 'comunidade 2', 'comunidade 3', 'comunidade 4']
  });
}); 

app.use(routes);

// Adicionando as rotas de postagem
app.use('/api/postagen', postagemRoutes); 

app.listen(8080, () => {
  console.log("Rodando na porta 8080");
});
