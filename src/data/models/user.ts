export const USER_LICENSES = [
  'full',
  'limited',
] as const

export interface User {
  companyId?: string
  createdAt: Date
  email: string
  firstName: string
  id: string
  lastName?: string
  license?: typeof USER_LICENSES[number]
  updatedAt: Date
}
