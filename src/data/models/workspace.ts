export interface Workspace {
  companyId?: string
  createdAt: Date
  id: string
  name: string
  status: 'active' | 'archived' | 'trial_expired' | 'unpaid'
  updatedAt: Date
}
