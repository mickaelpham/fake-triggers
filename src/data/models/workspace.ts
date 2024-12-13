export const WORKSPACE_STATUSES = [
  'active',
  'archived',
  'unpaid',
] as const

export interface Workspace {
  companyId?: string
  createdAt: Date
  id: string
  name: string
  status: typeof WORKSPACE_STATUSES[number]
  updatedAt: Date
}
