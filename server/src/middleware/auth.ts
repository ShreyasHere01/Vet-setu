import { Request , Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request{
    user?:{
        userId:number;
        role:string
    }
};

export const protect = (req:AuthRequest, res:Response, next:NextFunction)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({
            error:"No token provided"
        })
    }
    const token =authHeader.split(' ')[1];
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET as string) as{ userId:number ; role:string };
        req.user=decoded;
      
   

        next();

    } catch(e){
         return res.status(401).json({ error: 'Invalid or expired token' });

    }
}

export const requireRole = (...allowedRole:string[])=>{
    return (req:AuthRequest, res:Response,next:NextFunction)=>{

        if(!req.user || !allowedRole.includes(req.user.role)){
            return res.status(401).json({
                error:"You are not allowed to do this "
            })
        }
        next();
    }
}