import type { Company } from '../../data/models/company.js'
import { faker } from '@faker-js/faker'
import { generateId } from '../../common/generate-id.js'

export function buildCompany(params?: Partial<Company>): Company {
  return {
    createdAt: faker.date.past({ years: 15 }),
    id: generateId('company'),
    name: faker.company.name(),
    updatedAt: faker.date.recent({ days: 500 }),
    ...params
  }
}
