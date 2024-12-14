import type { USER_LICENSES } from './user.js'
import type { WORKSPACE_MEMBER_ROLES } from './workspace-member.js'

interface GroupWorkspace {
  role: typeof WORKSPACE_MEMBER_ROLES[number]
  workspaceId: string
}

export interface Group {
  companyId: string
  createdAt: Date
  id: string
  license?: typeof USER_LICENSES[number]
  name: string
  updatedAt: Date
  workspaces: GroupWorkspace[]
}
