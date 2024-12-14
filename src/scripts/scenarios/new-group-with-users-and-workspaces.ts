import { logger } from '../../common/logger.js'
import { COLLECTIONS, mongo } from '../../data/providers/mongo.js'
import { buildCompany } from '../factories/companies.js'
import { buildGroupMember } from '../factories/group-members.js'
import { buildGroup } from '../factories/groups.js'
import { buildUser } from '../factories/users.js'
import { buildWorkspace } from '../factories/workspace.js'

const SEED_WORKSPACES = 3
const SEED_USERS = 5

async function newGroupWithUsersAndWorkspaces() {
  const company = buildCompany()
  await COLLECTIONS.COMPANIES.insertOne(company, { ignoreUndefined: true })

  const workspaces = Array.from(
    { length: SEED_WORKSPACES },
    () => buildWorkspace({ companyId: company.id }),
  )
  await COLLECTIONS.WORKSPACES.insertMany(workspaces, { ignoreUndefined: true })

  const users = Array.from(
    { length: SEED_USERS },
    () => buildUser({ companyId: company.id }),
  )
  await COLLECTIONS.USERS.insertMany(users, { ignoreUndefined: true })

  const group = buildGroup(company, workspaces)
  await COLLECTIONS.GROUPS.insertOne(group, { ignoreUndefined: true })

  const groupMembers = users.map(user => buildGroupMember(group, user))
  await COLLECTIONS.GROUP_MEMBERS.insertMany(groupMembers, { ignoreUndefined: true })
}

newGroupWithUsersAndWorkspaces()
  .then(() => { mongo.close() })
  .catch(logger.error)
