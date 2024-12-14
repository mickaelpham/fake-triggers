import type { User } from '../../data/models/user.js'
import { faker } from '@faker-js/faker'
import { generateId } from '../../common/generate-id.js'

export function buildUser(params?: Partial<User>): User {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const email = faker.internet.email({ firstName, lastName }).toLocaleLowerCase()

  return {
    createdAt: faker.date.past({ years: 15 }),
    email,
    firstName,
    id: generateId('user'),
    lastName,
    updatedAt: faker.date.recent({ days: 500 }),
    ...params,
  }
}
