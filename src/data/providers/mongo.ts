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

export const mongo = new MongoClient(DATABASE_URL)

export const COLLECTIONS = {
  SEARCH_WORKSPACE_MEMBERS: mongo.db().collection<SearchWorkspaceMember>('search_workspace_members'),
  USERS: mongo.db().collection<User>('users'),
  WORKSPACE_MEMBERS: mongo.db().collection<WorkspaceMember>('workspace_members'),
  WORKSPACES: mongo.db().collection<Workspace>('workspaces'),
} as const

export async function createIndexes() {
  await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS.createIndexes([
    { key: { workspaceId: 1, userId: 1 }, unique: true },
    { key: { workspaceId: 1, role: 1 } },
    { key: { workspaceId: 1, email: 1 } },
    { key: { workspaceId: 1, fullName: 1 } },
    { key: { workspaceId: 1, createdAt: 1 } },
    { key: { workspaceId: 1, updatedAt: 1 } },
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

export async function dropIndexes() {
  await Promise.all(Object.values(COLLECTIONS).map(c => c.dropIndexes()))
}
