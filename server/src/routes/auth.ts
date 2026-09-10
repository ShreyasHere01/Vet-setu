import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { signupSchema ,loginSchema } from '../schema/auth.schema';
import { error } from 'node:console';
import { ro } from 'zod/locales';

const router =express.Router();

router.post("/signup", async(req,res)=>{
    try{
        const result =signupSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                error:result.error.issues[0].message
            })
        }

        const {name, email,password,role}=result.data;
        const existingUSer= await prisma.user.findUnique({
            where:{email},
        });
        if(existingUSer){
            return res.status(400).json({
                error:"email already exist"
            });
        }

        const hashPassword = await bcrypt.hash(password,10);

        const user=await prisma.user.create({
            data:{
                name:name,
                email:email,
                password:hashPassword,
                role:role,
            },
        });

        res.status(201).json({
            id:user.id,
            name:user.name,
            email:user.email,
            role:user.role

        });
    }catch{
    console.error(error);
    res.status(500).json({
        error:"something went wrong"
    })
}

} 
);


router.post("/login",async (req , res)=>{
    try{
        const result= loginSchema.safeParse(req.body);
        
        if(!result.success){
            return res.status(400).json({
                error:result.error.issues[0].message
            })
        }

        const {email , password}=result.data;
        const user = await prisma.user.findUnique({
            where:{email}
        });

        if(!user){
            return res.status(400).json({
                error:"Invalid email or password"
            })
        }
        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({
                error:"Invalid email or password "
            })
        }
        const token = jwt.sign({
            userId:user.id,
            role:user.role
        },process.env.JWT_SECRET as string,
    {
        expiresIn:"7d",
    })
     
    res.json({
        token,
        user:{
            id:user.id,
            name:user.name,
            email:user.email,
            role:user.role
        },
    });

    } catch(error){
        console.error(error);
        res.status(500).json({
            error:"somthing went wrong"
        })
    }
});

export default router;