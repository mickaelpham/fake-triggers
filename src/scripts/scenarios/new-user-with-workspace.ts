import { generateId } from '../../common/generate-id.js'
import { logger } from '../../common/logger.js'
import { User } from '../../data/models/user.js'
import { COLLECTIONS, mongo } from '../../data/providers/mongo.js'
import { buildUser } from '../factories/users.js'
import { buildWorkspaceMember } from '../factories/workspace-member.js'
import { buildWorkspace } from '../factories/workspace.js'

async function newUserWithWorkspace() {
  const user = buildUser()
  await COLLECTIONS.USERS.insertOne({ ...user }, { ignoreUndefined: true })

  const workspace = buildWorkspace()
  await COLLECTIONS.WORKSPACES.insertOne({ ...workspace }, { ignoreUndefined: true })

  const workspaceMember = buildWorkspaceMember(user, workspace)
  await COLLECTIONS.WORKSPACE_MEMBERS.insertOne({ ...workspaceMember }, { ignoreUndefined: true })
}

newUserWithWorkspace()
  .then(() => mongo.close())
  .catch((ex) => { logger.error(ex) })
