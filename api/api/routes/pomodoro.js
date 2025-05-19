import { db } from "../db.js";
import express from 'express';

export async function registrarCicloPomodoro(idUsuario, cicloNumero, segundosGastos) {
    const query = `
    INSERT INTO pomodoro_t01 (ID_USUARIO_T01, CICLO_NUMERO, SEGUNDOS_GASTOS)
    VALUES (?, ?, ?)
  `;
    return db.query(query, [idUsuario, cicloNumero, segundosGastos]);
}


const router = express.Router();

router.post('/registrar', async (req, res) => {
    const { cicloNumero, segundosGastos } = req.body;
    const user = req.session.user;

    if (!user) {
        return res.status(401).json({ message: "Não autenticado" });
    }

    try {
        await registrarCicloPomodoro(user.ID_USUARIO_T01, cicloNumero, segundosGastos);
        res.status(200).json({ message: "Ciclo registrado com sucesso!" });
    } catch (err) {
        console.error("Erro ao registrar ciclo:", err);
        res.status(500).json({ message: "Erro ao registrar ciclo" });
    }
});

router.post('/tempo', async (req, res) => {
    const userId = req.session.userId;
    const { tempo } = req.body;

    try {
        await db.query('UPDATE usuarios SET tempo_estudo = $1 WHERE id = $2', [tempo, userId]);
        res.status(200).send('Tempo salvo com sucesso');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao salvar tempo');
    }
});

router.get('/painel', async (req, res) => {
    const userId = req.session.userId;

    try {
        const result = await db.query('SELECT tempo_estudo FROM usuarios WHERE id = $1', [userId]);
        const tempoEstudo = result.rows[0].tempo_estudo || 0;

        res.render('painel', { tempoEstudo }); // Ex: 3600 segundos
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar tempo');
    }
});

export default router;
