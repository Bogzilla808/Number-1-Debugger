import { User } from "../models/User.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
    const {name, email, password, role} = req.body;
    
    try {
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create(
            {
                name,
                email,
                password_hash: hash,
                role
            }
        );
        res.status(201).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token: "dummy-token"   
        });
    } catch(err) {
        console.error("register error", err);
        res.status(400).json({error: err.message});        
    }
};

export const loginUser = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({where: {email}});
        if(!user) {
            return res.status(401).json({error: "Invalid email or password"});
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if(!isMatch) {
            return res.status(401).json({error: "Invalid email or password."});
        }
        res.status(200).json(
            {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token: "dummy-token"
            }
        );
    } catch (err) {
        console.log("login error", err);
        res.status(500).json({ error: "Server error"});
    }
};