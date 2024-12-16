import type { User } from '../../data/models/user.js'
import { faker } from '@faker-js/faker'
import { nanoid } from 'nanoid'
import { generateId } from '../../common/generate-id.js'

export function buildUser(params?: Partial<User>): User {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  // insert a nanoid in the email to prevent duplicate entries
  const [username, domain] = faker.internet
    .email({ firstName, lastName })
    .toLocaleLowerCase()
    .split('@')

  const email = `${username}${nanoid()}@${domain}`

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
