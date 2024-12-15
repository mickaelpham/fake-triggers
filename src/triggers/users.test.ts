import type { User } from '../data/models/user.js'
import type { WorkspaceMember } from '../data/models/workspace-member.js'
import type { Workspace } from '../data/models/workspace.js'
import { faker } from '@faker-js/faker'
import { beforeEach, describe, expect, it } from 'vitest'
import { sleepFor } from '../common/sleep-for.js'
import { COLLECTIONS } from '../data/providers/mongo.js'
import { buildUser } from '../scripts/factories/users.js'
import { buildWorkspaceMember } from '../scripts/factories/workspace-member.js'
import { buildWorkspace } from '../scripts/factories/workspace.js'

interface LocalTestContext {
  user: User
  workspaceMembers: WorkspaceMember[]
  workspaces: Workspace[]
}

const TEST_WORKSPACES = 2
const SLEEP_DURATION_MS = 20

describe('onUsersUpdate', async () => {
  beforeEach<LocalTestContext>(async (context) => {
    const user = buildUser()
    await COLLECTIONS.USERS.insertOne(user)

    const workspaces = Array.from({ length: TEST_WORKSPACES }, buildWorkspace)
    await COLLECTIONS.WORKSPACES.insertMany(workspaces)

    const workspaceMembers = workspaces.map(workspace => buildWorkspaceMember(user, workspace))
    await COLLECTIONS.WORKSPACE_MEMBERS.insertMany(workspaceMembers)

    context.user = user
    context.workspaceMembers = workspaceMembers
    context.workspaces = workspaces

    // give the triggers some time to execute
    await sleepFor(SLEEP_DURATION_MS)
  })

  it<LocalTestContext>('creates the search workspace member records', async (context) => {
    const searchWorkspaceMembers = await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS
      .find({ userId: context.user.id, workspaceId: { $in: context.workspaces.map(w => w.id) } })
      .toArray()

    expect(searchWorkspaceMembers.length).toBe(context.workspaceMembers.length)
  })

  it<LocalTestContext>(
    'updates the search workspace member record when changing the email',
    async ({ user, workspaces }) => {
      const searchWorkspaceMembers = await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS
        .find({ userId: user.id, workspaceId: { $in: workspaces.map(w => w.id) } })
        .toArray()

      searchWorkspaceMembers.forEach((record) => {
        expect(record.email).toBe(user.email)
      })

      const newEmail = faker.internet.email()
      await COLLECTIONS.USERS.updateOne({ id: user.id }, { $set: { email: newEmail } })

      // give the triggers some time to execute
      await sleepFor(SLEEP_DURATION_MS)

      const updatedRecordCount = await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS
        .countDocuments({ userId: user.id, email: newEmail })

      expect(updatedRecordCount).toBe(workspaces.length)
    },
  )
})
