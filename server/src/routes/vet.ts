import prisma from "../lib/prisma";
import express from "express";
import { protect, requireRole } from "../middleware/auth";
import { slotSchema } from "../schema/vet.schema";


const router =express.Router();

router.post("/profile" , protect, requireRole("VET"),async (req:any, res)=>{
    
    try{
    const {specialty , bio } = req.body;
    const existingVet= await prisma.vet.findUnique({
        where:{
            userId:req.user.userId,
        },
    })

    if(existingVet){
        return res.status(401).json({
            error:"vet profile alredy exist"
        })
    }
    const vet = await prisma.vet.create({
        data:{
            userId:req.user.userId,
            specialty,
            bio
        }
    })

    res.status(201).json(vet);

    } catch(error){
         console.error(error);
         res.status(500).json({
            error:"Failed to create vet"
         })
    }

});


router.post("/slots",protect, requireRole("VET"), async (req:any ,res)=>{
    try{
          
     const result = slotSchema.safeParse(req.body);

if (!result.success) {
  return res.status(400).json({
    error: result.error.issues[0].message,
  });
}

const { startTime, endTime } = result.data; 
    
      const userId = req.user.userId;



const vet = await prisma.vet.findUnique({
  where: {
    userId: userId,
  },
});

      if(!vet){
        return res.status(404).json({
            error:"vet profile not found"
        })
      }
      const slot =await prisma.slot.create({
        data:{
            vetId:vet.id,
            startTime:new Date(startTime),
            endTime:new Date(endTime)
        }
      });

      res.status(201).json(slot);

    }catch(error:any){
          console.error(error);

          if(error.code==="P2002"){
            return res.status(409).json({
                error:"This time slot is already booked"
            })
          }

          res.status(500).json({
            error:"Failed to cretae slot"
          })
    }
});


router.get("/", async (req, res) => {
  try {
    const vets = await prisma.vet.findMany({
      where: {
        verified: true,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json(vets);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch vets",
    });
  }
});


router.get("/:vetId", async (req, res) => {
  try {
    const vetId = Number(req.params.vetId);

    const vet = await prisma.vet.findUnique({
      where: {
        id: vetId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!vet) {
      return res.status(404).json({
        error: "Vet not found",
      });
    }

    res.json(vet);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch vet",
    });
  }
});

router.get("/:vetId/slots", async (req, res) => {
  try {
    const vetId = Number(req.params.vetId);

    const slots = await prisma.slot.findMany({
      where: {
        vetId,
        isBooked: false,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    res.json(slots);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch slots",
    });
  }
});


export default router;