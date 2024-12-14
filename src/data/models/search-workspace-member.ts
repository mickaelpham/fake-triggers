import type { USER_LICENSES } from './user.js'
import type { WORKSPACE_MEMBER_ROLES } from './workspace-member.js'

interface Group {
  groupId: string
  license?: typeof USER_LICENSES[number]
  role: typeof WORKSPACE_MEMBER_ROLES[number]
}

export interface SearchWorkspaceMember {
  createdAt: Date
  email: string
  fullName: string
  groups: Group[]
  role?: typeof WORKSPACE_MEMBER_ROLES[number] // discrete role
  updatedAt: Date
  userCompanyId?: string
  userId: string
  userLicense?: typeof USER_LICENSES[number]
  workspaceCompanyId?: string
  workspaceId: string
}
