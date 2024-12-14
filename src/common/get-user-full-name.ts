import type { User } from '../data/models/user.js'

export function getUserFullName(user: Pick<User, 'firstName' | 'lastName'>) {
  if (!user.lastName) {
    return user.firstName
  }

  return `${user.firstName} ${user.lastName}`
}
