import type { Group } from '../data/models/group.js'
import type { User } from '../data/models/user.js'
import type { Workspace } from '../data/models/workspace.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { getUserFullName } from '../common/get-user-full-name.js'
import { sleepFor } from '../common/sleep-for.js'
import { COLLECTIONS } from '../data/providers/mongo.js'
import { buildCompany } from '../scripts/factories/companies.js'
import { buildGroupMember } from '../scripts/factories/group-members.js'
import { buildGroup } from '../scripts/factories/groups.js'
import { buildUser } from '../scripts/factories/users.js'
import { buildWorkspace } from '../scripts/factories/workspace.js'

interface LocalTestContext {
  groups: { admin: Group, member: Group }
  users: User[]
  workspace: Workspace
}

const TEST_USERS = 2
const SLEEP_DURATION_MS = 20

describe('onGroupUpdate', () => {
  beforeEach<LocalTestContext>(async (context) => {
    const company = buildCompany()
    await COLLECTIONS.COMPANIES.insertOne(company)

    const users = Array.from({ length: TEST_USERS }, () => buildUser({ companyId: company.id }))
    await COLLECTIONS.USERS.insertMany(users)

    // create a member group with all users, and an admin group with the first user
    const memberGroup = buildGroup(company, [])
    await COLLECTIONS.GROUPS.insertOne(memberGroup)
    await COLLECTIONS.GROUP_MEMBERS.insertMany(users.map(user => buildGroupMember(memberGroup, user)))

    const adminGroup = buildGroup(company, [])
    await COLLECTIONS.GROUPS.insertOne(adminGroup)
    await COLLECTIONS.GROUP_MEMBERS.insertOne(buildGroupMember(adminGroup, users[0]))

    // create a workspace and map both groups to it with their respective roles
    const workspace = buildWorkspace({ companyId: company.id })
    await COLLECTIONS.WORKSPACES.insertOne(workspace)
    await COLLECTIONS.GROUPS.updateOne(
      { id: memberGroup.id },
      { $push: { workspaces: { workspaceId: workspace.id, role: 'member' } } },
    )
    await COLLECTIONS.GROUPS.updateOne(
      { id: adminGroup.id },
      { $push: { workspaces: { workspaceId: workspace.id, role: 'admin' } } },
    )

    context.users = users
    context.groups = { admin: adminGroup, member: memberGroup }
    context.workspace = workspace

    // give the triggers some time to execute
    await sleepFor(SLEEP_DURATION_MS)
  })

  it<LocalTestContext>('creates the search workspace member records', async ({ groups, users, workspace }) => {
    const records = await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS
      .find({ userId: { $in: users.map(u => u.id) }, workspaceId: workspace.id })
      .toArray()

    expect(records.length).toBe(TEST_USERS)

    // both records have the member group assigned
    for (const record of records) {
      expect(record.groups).toContainEqual({ groupId: groups.member.id, role: 'member' })
    }

    const admin = users[0]
    const adminRecord = records.find(r => r.userId === admin.id)
    if (!adminRecord) {
      throw new Error('missing admin record')
    }

    expect(adminRecord.groups).toContainEqual({ groupId: groups.admin.id, role: 'admin' })

    expect(adminRecord).toMatchObject({
      email: admin.email,
      fullName: getUserFullName(admin),
    })
  })

  it<LocalTestContext>('adds the group license to all records', async ({ groups, workspace }) => {
    await COLLECTIONS.GROUPS.updateOne(
      { id: groups.admin.id },
      { $set: { license: 'full' } },
    )

    // give the triggers some time to execute
    await sleepFor(SLEEP_DURATION_MS)

    const records = await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS
      .find({ 'groups.groupId': groups.admin.id, 'workspaceId': workspace.id })
      .toArray()

    expect(records.length).toBe(1)
    const record = records[0]

    expect(record.groups).toContainEqual({ groupId: groups.admin.id, role: 'admin', license: 'full' })
  })
})
