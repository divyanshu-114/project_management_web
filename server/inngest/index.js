import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

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
    

// inngest function to save workspace data to a database
const syncWorkspaceCreation = inngest.createFunction(
    {id: 'sync-workspace-from-clerk'},
    {event: 'clerk/organization.created'},
    async ({event}) => {
      const {data} = event;
      try {
      await prisma.workspace.create({
        data: {
          id: data.id,
          name: data.name,
          slug: data.slug,
          ownerId: data.created_by,
          image_url: data.image_url,
        }
      })

      // add creator as admin member
      await prisma.workspaceMember.create({
        data: {
          userId: data.created_by,
          workspaceId: data.id,
          role: 'ADMIN',
        }
      })
      }catch (error) {
         console.error('Prisma error in syncWorkspaceCreation:', error);
        throw error; // rethrow so Inngest shows failure
      }
    }
)

// inngest function to update workspace data in database

const syncWorkspaceUpdation = inngest.createFunction(
    {id: 'update-workspace-from-clerk'},
    {event: 'clerk/organization.updated'},
    async ({event}) => {
      const {data} = event;
      try {
      await prisma.workspace.update({
        where:{
            id:data.id
        },
        data:{
            name:data.name,
            slug:data.slug,
            image_url:data.image_url,
        }
      })
      }catch (error) {
         console.error('Prisma error in syncWorkspaceUpdation:', error);
        throw error; // rethrow so Inngest shows failure
      }
    }
)

// inngest function to delete workspace data from database
const syncWorkspaceDeletion = inngest.createFunction(
    {id: 'delete-workspace-with-clerk'},
    {event: 'clerk/organization.deleted'},
    async ({event}) => {
      const {data} = event;
      try {
      await prisma.workspace.delete({
        where :{
            id: data.id
        }
      })
      }catch (error) {
         console.error('Prisma error in syncWorkspaceDeletion:', error);
        throw error; // rethrow so Inngest shows failure
      }
    }
)

// inngest function to save workspace member data to a database
const syncWorkspaceMemberCreation = inngest.createFunction(
    {id: 'sync-workspace-member-from-clerk'},
    {event: 'clerk/organization.member.accepted'},
    async ({event}) => {
      const {data} = event;
      try {
      await prisma.workspaceMember.create({
        data: {
          userId: data.user_id,
          workspaceId: data.organization_id,
          role: String(data.role_name).toUpperCase(),
        }
      })
      }catch (error) {
         console.error('Prisma error in syncWorkspaceMemberCreation:', error);
        throw error; // rethrow so Inngest shows failure
      }
    }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    syncWorkspaceCreation,
    syncWorkspaceUpdation,
    syncWorkspaceDeletion,
    syncWorkspaceMemberCreation,   
];