import type { GroupMember } from '../../data/models/group-member.js'
import type { Group } from '../../data/models/group.js'
import type { User } from '../../data/models/user.js'
import { faker } from '@faker-js/faker'

export function buildGroupMember(
  group: Pick<Group, 'id'>,
  user: Pick<User, 'id'>,
  params?: Partial<GroupMember>,
): GroupMember {
  return {
    createdAt: faker.date.past({ years: 15 }),
    groupId: group.id,
    updatedAt: faker.date.recent({ days: 500 }),
    userId: user.id,
    ...params,
  }
}
