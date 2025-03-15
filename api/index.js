import express from "express"
import cors from "cors"
const app = express()
app.use(express.static("public"));
app.use(express.json())
app.use(cors())

app.set('view engine', 'ejs');
app.set('views', './view');

app.get('/', (req, res) => {
  res.status(200).render('index', 
    { 
        title: 'Página Inicial', 
        message: 'Bem-vindo ao Express com EJS!' 
    });
});

app.get('/login', (req, res) => {
    res.status(200).render('login');
});

app.get('/cadastro', (req, res) => {
    res.status(200).render('cadastro');
});

app.get('/landingPage', (req, res) => {
    res.status(200).render('landingPage');
});

app.listen(8800, () => {
    console.log("rodando na porta 8800")
})