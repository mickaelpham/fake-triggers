import type { Group } from '../../data/models/group.js'
import { Presets, SingleBar } from 'cli-progress'
import _ from 'lodash'
import { logger } from '../../common/logger.js'
import { sleepFor } from '../../common/sleep-for.js'
import { WORKSPACE_MEMBER_ROLES } from '../../data/models/workspace-member.js'
import { COLLECTIONS, mongo, setChangeStreamPreAndPostImages } from '../../data/providers/mongo.js'
import { buildCompany } from '../factories/companies.js'
import { buildGroupMember } from '../factories/group-members.js'
import { buildGroup } from '../factories/groups.js'
import { buildUser } from '../factories/users.js'
import { buildWorkspace } from '../factories/workspace.js'

const TEST_USERS = 200_000
const TEST_WORKSPACES = 3
const CHUNK_SIZE = 400

async function oneGroup200kUsers() {
  const company = buildCompany()
  await COLLECTIONS.COMPANIES.insertOne(company)

  const group = buildGroup(company, [])
  await COLLECTIONS.GROUPS.insertOne(group)

  const users = Array.from({ length: TEST_USERS }, () => buildUser({ companyId: company.id }))
  const bar = new SingleBar({}, Presets.shades_classic)
  bar.start(TEST_USERS, 0)
  for (const chunk of _.chunk(users, CHUNK_SIZE)) {
    await COLLECTIONS.USERS.insertMany(chunk)

    const groupMembers = chunk.map(user => buildGroupMember(group, user))
    await COLLECTIONS.GROUP_MEMBERS.insertMany(groupMembers)

    bar.increment(chunk.length)
  }
  bar.stop()

  // now create the workspaces
  const workspaces = Array.from({ length: TEST_WORKSPACES }, () => buildWorkspace({ companyId: company.id }))
  await COLLECTIONS.WORKSPACES.insertMany(workspaces)

  // and map them to the group (this will take a while in the triggers I think)
  const groupWorkspaces: Group['workspaces'] = workspaces.map(
    w => ({ workspaceId: w.id, role: _.sample(WORKSPACE_MEMBER_ROLES) }),
  )

  await COLLECTIONS.GROUPS.updateOne(
    { id: group.id },
    { $push: { workspaces: { $each: groupWorkspaces } } },
  )
}

oneGroup200kUsers()
  .then(() => { mongo.close() })
  .catch((ex) => { logger.error(ex) })
