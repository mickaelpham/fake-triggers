import type { UpdateDescription } from 'mongodb'
import type { SearchWorkspaceMember } from '../data/models/search-workspace-member.js'
import type { WorkspaceMember } from '../data/models/workspace-member.js'
import { getUserFullName } from '../common/get-user-full-name.js'
import { logger } from '../common/logger.js'
import { COLLECTIONS } from '../data/providers/mongo.js'

export async function onWorkspaceMembersInsert(fullDocument: WorkspaceMember) {
  logger.info({ fullDocument }, 'onWorkspaceMembersInsert')

  // fetch the user profile information
  const user = await COLLECTIONS.USERS.findOne({ id: fullDocument.userId })
  if (!user) {
    logger.error({ userId: fullDocument.userId }, 'missing user')
    return
  }

  // fetch the workspace information
  const workspace = await COLLECTIONS.WORKSPACES.findOne({ id: fullDocument.workspaceId })
  if (!workspace) {
    logger.error({ workspaceId: fullDocument.workspaceId }, 'missing workspace')
    return
  }

  // insert the denormalized search workspace member record
  const searchWorkspaceMember: SearchWorkspaceMember = {
    createdAt: fullDocument.createdAt,
    email: user.email,
    fullName: getUserFullName(user),
    groups: [],
    role: fullDocument.role,
    updatedAt: fullDocument.updatedAt,
    userCompanyId: user.companyId,
    userId: fullDocument.userId,
    userLicense: user.license,
    workspaceCompanyId: workspace.companyId,
    workspaceId: fullDocument.workspaceId,
  }

  await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS.insertOne(
    { ...searchWorkspaceMember },
    { ignoreUndefined: true },
  )
}

export async function onWorkspaceMembersUpdate(
  fullDocument: WorkspaceMember,
  updateDescription: UpdateDescription<WorkspaceMember>,
) {
  logger.info({ fullDocument, updateDescription }, 'onWorkspaceMembersUpdate')

  await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS.updateOne(
    { userId: fullDocument.userId, workspaceId: fullDocument.workspaceId },
    {
      $set: {
        role: fullDocument.role,
        updatedAt: fullDocument.updatedAt,
      },
    },
    { ignoreUndefined: true },
  )
}

export async function onWorkspaceMembersDelete(fullDocumentBeforeChange: WorkspaceMember) {
  logger.info({ fullDocumentBeforeChange }, 'onWorkspaceMembersDelete')

  await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS.deleteOne(
    {
      userId: fullDocumentBeforeChange.userId,
      workspaceId: fullDocumentBeforeChange.workspaceId,
    },
  )
}
