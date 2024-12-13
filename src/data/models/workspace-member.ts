export const WORKSPACE_MEMBER_ROLES = [
  'admin',
  'guest',
  'member',
] as const

export interface WorkspaceMember {
  createdAt: Date
  role: typeof WORKSPACE_MEMBER_ROLES[number]
  updatedAt: Date
  userId: string
  workspaceId: string
}
