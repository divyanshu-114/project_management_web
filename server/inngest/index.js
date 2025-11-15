import { Inngest } from "inngest";
import {prisma} from "../configs/prisma";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "project-management" });

const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event}) => {
      const {data} = event;
      try {
      await prisma.user.create({
        data: {
          id: data.id,
          email: data?.email_addresses?.[0]?.email_address,
          name: data?.first_name + ' ' + data?.last_name,
          image: data?.image_url,
        }
      })
      }catch (error) {
         console.error('Prisma error in syncUserCreation:', error);
        throw error; // rethrow so Inngest shows failure
      }
    }
)

// inngest function to delete user from database 
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-with-clerk'},
    {event: 'clerk/user.deleted'},
    async ({event}) => {
      const {data} = event;
      try {
      await prisma.user.delete({
        where :{
            id: data.id
        }
      })
      }catch (error) {
         console.error('Prisma error in syncUserDeletion:', error);
        throw error; // rethrow so Inngest shows failure
      }
    }
)

// inngest function to update user data in database

const syncUserUpdation= inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({event}) => {
      const {data} = event;
      try {
      await prisma.user.update({
        where:{
            id:data.id
        },
        data:{
            email:data?.email_addresses?.[0]?.email_address,
            name:data?.first_name + ' ' + data?.last_name,
            image:data?.image_url,
        }
      })
      }catch (error) {
         console.error('Prisma error in syncUserUpdation:', error);
        throw error; // rethrow so Inngest shows failure
      }
    }
)
    
// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation,
    syncUserDeletion,
    syncUserUpdation   
];