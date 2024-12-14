import { logger } from '../../common/logger.js'
import { COLLECTIONS, mongo } from '../../data/providers/mongo.js'
import { buildUser } from '../factories/users.js'
import { buildWorkspaceMember } from '../factories/workspace-member.js'
import { buildWorkspace } from '../factories/workspace.js'

const SEED_WORKSPACES = 3

async function newUserWithWorkspace() {
  const user = buildUser()
  await COLLECTIONS.USERS.insertOne(user, { ignoreUndefined: true })

  const workspaces = Array.from({ length: SEED_WORKSPACES }, buildWorkspace)
  await COLLECTIONS.WORKSPACES.insertMany(workspaces, { ignoreUndefined: true })

  const workspaceMembers = workspaces.map(workspace => buildWorkspaceMember(user, workspace))
  await COLLECTIONS.WORKSPACE_MEMBERS.insertMany(workspaceMembers, { ignoreUndefined: true })
}

newUserWithWorkspace()
  .then(() => mongo.close())
  .catch((ex) => { logger.error(ex) })
