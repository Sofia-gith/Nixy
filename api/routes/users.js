import express from "express"
import {getUsers} from "../controlers/users.js"

const router = express.Router()

router.get("/", getUsers)

export default router 

export const addUser = (req, res) => {

    "INSERT INTO USUARIO('')"

        const values =[
            req.body.,
            req.body.,
            req.body.,

        ]  
        
        db.query(q, [values], (err) => {

            if(err) return res.json(err);

            return res.status(200).json("Usuário criado com sucesso");

            
        });

    }