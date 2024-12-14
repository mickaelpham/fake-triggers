import type { GroupMember } from '../data/models/group-member.js'
import partition from 'lodash/partition.js'
import { getUserFullName } from '../common/get-user-full-name.js'
import { logger } from '../common/logger.js'
import { COLLECTIONS } from '../data/providers/mongo.js'

export async function onGroupMembersInsert(fullDocument: GroupMember) {
  logger.info({ fullDocument }, 'onGroupMembersInsert')

  // fetch the user profile
  const user = await COLLECTIONS.USERS.findOne({ id: fullDocument.userId })
  if (!user) {
    logger.error({ userId: fullDocument.userId }, 'missing user')
    return
  }

  // fetch the group
  const group = await COLLECTIONS.GROUPS.findOne({ id: fullDocument.groupId })
  if (!group) {
    logger.error({ groupId: fullDocument.groupId }, 'missing group')
    return
  }

  // retrieve existing denormalized records
  const existingRecords = await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS.find(
    { userId: user.id, workspaceId: { $in: group.workspaces.map(w => w.workspaceId) } },
  ).toArray()

  const [update, insert] = partition(
    group.workspaces,
    w => existingRecords.some(record => record.workspaceId === w.workspaceId),
  )

  // update existing denormalized records
  for (const workspace of update) {
    await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS.updateOne(
      { userId: user.id, workspaceId: workspace.workspaceId },
      {
        $set: {
          'updatedAt': fullDocument.updatedAt,
          'group.$[groupId]': {
            groupId: group.id,
            license: group.license,
            role: workspace.role,
          },
        },
      },
      {
        arrayFilters: [{ groupId: group.id }],
        ignoreUndefined: true,
      },
    )
  }

  // insert new denormalized records
  for (const workspace of insert) {
    await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS.insertOne(
      {
        createdAt: fullDocument.createdAt,
        email: user.email,
        fullName: getUserFullName(user),
        groups: [
          { groupId: group.id, license: group.license, role: workspace.role },
        ],
        updatedAt: fullDocument.updatedAt,
        userCompanyId: user.companyId,
        userId: user.id,
        userLicense: user.license,
        workspaceCompanyId: group.companyId, // skip workspaces fetch (should be of the same company)
        workspaceId: workspace.workspaceId,
      },
      { ignoreUndefined: true },
    )
  }
}

export async function onGroupMembersDelete(fullDocumentBeforeChange: GroupMember) {
  logger.info({ fullDocumentBeforeChange }, 'onGroupMembersDelete')

  await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS.updateMany(
    { userId: fullDocumentBeforeChange.userId },
    {
      $pull: { groups: { groupId: fullDocumentBeforeChange.groupId } },
      updatedAt: new Date(),
    },
    { ignoreUndefined: true },
  )
}
