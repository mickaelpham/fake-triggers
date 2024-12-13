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
  USERS: mongo.db().collection<User>('users'),
  WORKSPACE_MEMBERS: mongo.db().collection<WorkspaceMember>('workspace_members'),
  WORKSPACES: mongo.db().collection<Workspace>('workspaces'),
} as const

export async function createIndexes() {
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
  await COLLECTIONS.USERS.dropIndexes()
  await COLLECTIONS.WORKSPACE_MEMBERS.dropIndexes()
  await COLLECTIONS.WORKSPACES.dropIndexes()
}
