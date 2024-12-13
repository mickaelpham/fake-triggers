import type { USER_LICENSES } from './user.js'
import type { WORKSPACE_MEMBER_ROLES } from './workspace-member.js'

export interface SearchWorkspaceMember {
  createdAt: Date
  email: string
  fullName: string
  role: typeof WORKSPACE_MEMBER_ROLES[number]
  updatedAt: Date
  userCompanyId?: string
  userId: string
  userLicense?: typeof USER_LICENSES[number]
  workspaceCompanyId?: string
  workspaceId: string
}
