import { User } from "../models/User.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
    const {name, email, password} = req.body;
    
    try {
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create(
            {
                name,
                email,
                password_hash: hash
            }
        );
        res.setStatus(201).send({success: true});
    } catch(err) {
        res.status(400).json({error: err.message});        
    }
}