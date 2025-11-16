import  prisma  from "../configs/prisma.js";



//  get all workspaces for user

export const getUserWorkspaces = async (req, res) => {
  try {
    const { userId } = await req.auth();

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: { user: true },
        },
        projects: {
          include: {
            tasks: {
              include: {
                assignee: true,
                comments: {
                  include: { user: true },
                },
              },
            },
            // NOTE: `members` include is disabled for now to avoid PrismaClientValidationError.
            // Re-enable once your Prisma client is regenerated and in sync with schema:
            // members: {
            //   include: { user: true },
            // },
          },
        },
        owner: true,
      },
    });

    res.json({ workspaces });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//  Add member to workspace
export const addMember = async (req, res) => {
    try{
        const {userId} = await req.auth();
        const {email, role, workspaceId, message} = req.body;
        const user = await prisma.user.findUnique({where :{email}})
        
        // check if user exists
        if (!user){
            return res.status(404).json({message: "User not found"})
        }
        if (!workspaceId || !role){
            return res.status(400).json({message: "Missing required parameters"})
        }
        if (!["ADMIN", "MEMBER"].includes(role)){
            return res.status(400).json({message: "Invalid Role"})
        }

        //  fetch workspace
        const workspace = await prisma.workspace.findUnique({where :{id : 
            workspaceId},include :{members:true}});

        if(!workspace){
            return res.status(404).json({message: "Workspace not found"})
        }

        // check creator has admin role
        if(!workspace.members.find((member)=> member.userId === userId && member.role === "ADMIN")){
            return res.status(401).json({message: "You are not authorized to add member"})
        }

        // check if user is already a member
        if(workspace.members.find((member)=> member.userId === user.id)){
            return res.status(400).json({message: "User is already a member"})
        }

        // add member to workspace
        const member = await prisma.workspaceMember.create({
            data: {
                userId: user.id,
                workspaceId: workspaceId,
                role: role,
                message: message,
            }
        })
        res.json({member, message: "Member added successfully"})
        
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error"});
    }
}
