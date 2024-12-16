import type { Company } from '../models/company.js'
import type { GroupMember } from '../models/group-member.js'
import type { Group } from '../models/group.js'
import type { SearchWorkspaceMember } from '../models/search-workspace-member.js'
import type { User } from '../models/user.js'
import type { WorkspaceMember } from '../models/workspace-member.js'
import type { Workspace } from '../models/workspace.js'
import process from 'node:process'
import { MongoClient } from 'mongodb'

const { DATABASE_URL } = process.env
if (!DATABASE_URL) {
  throw new Error('missing DATABASE_URL env var')
}

export const mongo = new MongoClient(DATABASE_URL, { ignoreUndefined: true })

export const COLLECTIONS = {
  COMPANIES: mongo.db().collection<Company>('companies'),
  GROUP_MEMBERS: mongo.db().collection<GroupMember>('group_members'),
  GROUPS: mongo.db().collection<Group>('groups'),
  SEARCH_WORKSPACE_MEMBERS: mongo.db().collection<SearchWorkspaceMember>('search_workspace_members'),
  USERS: mongo.db().collection<User>('users'),
  WORKSPACE_MEMBERS: mongo.db().collection<WorkspaceMember>('workspace_members'),
  WORKSPACES: mongo.db().collection<Workspace>('workspaces'),
} as const

/**
 * Ensure we are setting the collections to have pre and post images for change streams
 */
export async function modifyCollectionsAndParams() {
  await mongo.db('admin').command({
    setClusterParameter: {
      changeStreamOptions: { preAndPostImages: { expireAfterSeconds: 100 } },
    },
  })

  const collections = ['group_members', 'groups', 'users', 'workspace_members']
  for (const collection of collections) {
    await setChangeStreamPreAndPostImages(collection, true)
  }
}

export async function setChangeStreamPreAndPostImages(collection: string, enabled: boolean) {
  await mongo.db().command({
    collMod: collection,
    changeStreamPreAndPostImages: { enabled },
  })
}

export async function createIndexes() {
  await COLLECTIONS.COMPANIES.createIndexes([
    { key: { id: 1 }, unique: true },
  ])

  await COLLECTIONS.GROUP_MEMBERS.createIndexes([
    { key: { groupId: 1, userId: 1 }, unique: true },
    { key: { userId: 1 } },
  ])

  await COLLECTIONS.GROUPS.createIndexes([
    { key: { id: 1 }, unique: true },
    { key: { companyId: 1 } },
    { key: { 'workspaces.workspaceId': 1 } },
  ])

  await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS.createIndexes([
    { key: { workspaceId: 1, userId: 1 }, unique: true },
    { key: { workspaceId: 1, role: 1 } },
    { key: { workspaceId: 1, email: 1 } },
    { key: { workspaceId: 1, fullName: 1 } },
    { key: { workspaceId: 1, createdAt: 1 } },
    { key: { workspaceId: 1, updatedAt: 1 } },
    { key: { 'groups.groupId': 1 }, sparse: true },
  ])

  await COLLECTIONS.USERS.createIndexes([
    { key: { id: 1 }, unique: true },
    { key: { email: 1 }, unique: true },
    { key: { companyId: 1 }, sparse: true },
  ])

  await COLLECTIONS.WORKSPACE_MEMBERS.createIndexes([
    { key: { workspaceId: 1, userId: 1 }, unique: true },
    { key: { userId: 1 } },
    { key: { workspaceId: 1, role: 1 } },
  ])

  await COLLECTIONS.WORKSPACES.createIndexes([
    { key: { id: 1 }, unique: true },
    { key: { companyId: 1 }, sparse: true },
  ])
}

export async function dropDatabase() {
  await mongo.db().dropDatabase()
}
