import type { UpdateDescription } from 'mongodb'
import type { Group } from '../data/models/group.js'
import { Presets, SingleBar } from 'cli-progress'
import _ from 'lodash'
import { getUserFullName } from '../common/get-user-full-name.js'
import { logger } from '../common/logger.js'
import { COLLECTIONS } from '../data/providers/mongo.js'

export async function onGroupsUpdate(
  updateDescription: UpdateDescription<Group>,
  fullDocument: Group,
  fullDocumentBeforeChange: Group,
) {
  logger.info({ fullDocument, fullDocumentBeforeChange, updateDescription }, 'onGroupsUpdate')

  // simple use case: we changed the group license
  if (
    updateDescription.updatedFields && Object.keys(updateDescription.updatedFields).length === 1 && updateDescription.updatedFields.license) {
    // update the license for each denormalized records
    const result = await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS.updateMany(
      { 'groups.groupId': fullDocument.id },
      { $set: { 'groups.$[group].license': fullDocument.license } },
      { arrayFilters: [{ 'group.groupId': fullDocument.id }] },
    )
    logger.debug({ result }, 'updated search workspace members group license')
    return
  }

  // other use case -> not handled yet (add mapped workspace, remove mapped workspace, edit mapped workspace)

  const preWorkspaces = fullDocumentBeforeChange.workspaces
  const postWorkspaces = fullDocument.workspaces

  // IMPORTANT Use the postWorkspaces first, otherwise you will be missing out on the update value
  //           to the fields other than the workspace ID
  const updated = _.intersectionBy(postWorkspaces, preWorkspaces, 'workspaceId')
  const added = _.differenceBy(postWorkspaces, updated, 'workspaceId')
  const removed = _.differenceBy(preWorkspaces, updated, 'workspaceId')

  logger.debug({ added, updated, removed }, 'group workspaces')

  for (const workspace of updated) {
    await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS.updateMany(
      { 'workspaceId': workspace.workspaceId, 'groups.groupId': fullDocument.id },
      {
        $set: {
          'groups.$[group]': {
            groupId: fullDocument.id,
            license: fullDocument.license,
            role: workspace.role,
          },
        },
      },
      {
        arrayFilters: [{ 'group.groupId': fullDocument.id }],
        ignoreUndefined: true,
      },
    )
  }

  for (const workspace of removed) {
    await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS.updateMany(
      { 'workspaceId': workspace.workspaceId, 'groups.groupId': fullDocument.id },
      { $pull: { groups: { groupId: fullDocument.id } } },
    )
  }

  // the most expensive queries is when we need to add mapped workspace to the group
  if (added.length === 0) {
    return
  }

  const groupMembers = await COLLECTIONS.GROUP_MEMBERS
    .find({ groupId: fullDocument.id })
    .toArray()

  const users = await COLLECTIONS.USERS
    .find({ id: { $in: groupMembers.map(m => m.userId) } })
    .toArray()

  logger.info({ users: users.length }, 'retrieved user profiles from group')

  const userById = _.keyBy(users, 'id')

  for (const workspace of added) {
    const bar = new SingleBar({}, Presets.shades_classic)
    bar.start(users.length, 0)

    for (const groupMember of groupMembers) {
      const user = userById[groupMember.userId]

      await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS.updateOne(
        { userId: groupMember.userId, workspaceId: workspace.workspaceId },
        {
          $push: { groups: { groupId: fullDocument.id, license: fullDocument.license, role: workspace.role } },
          $setOnInsert: {
            createdAt: fullDocument.updatedAt,
            email: user.email,
            fullName: getUserFullName(user),
            updatedAt: fullDocument.updatedAt,
            userCompanyId: user.companyId,
            userId: user.id,
            userLicense: user.license,
            workspaceCompanyId: fullDocument.companyId,
            workspaceId: workspace.workspaceId,
          },
        },
        { ignoreUndefined: true, upsert: true },
      )

      bar.increment()
    }
    bar.stop()
  }
}
