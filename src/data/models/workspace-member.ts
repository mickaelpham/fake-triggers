export interface WorkspaceMember {
  createdAt: Date
  role: 'admin' | 'member' | 'guest'
  updatedAt: Date
  userId: string
  workspaceId: string
}
