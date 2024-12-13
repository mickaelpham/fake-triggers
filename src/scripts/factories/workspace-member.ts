import type { User } from '../../data/models/user.js'
import type { Workspace } from '../../data/models/workspace.js'
import { faker } from '@faker-js/faker'
import sample from 'lodash/sample.js'
import { WORKSPACE_MEMBER_ROLES, type WorkspaceMember } from '../../data/models/workspace-member.js'

export function buildWorkspaceMember(
  user: Pick<User, 'id'>,
  workspace: Pick<Workspace, 'id'>,
  params?: Partial<WorkspaceMember>,
): WorkspaceMember {
  return {
    createdAt: faker.date.past({ years: 15 }), // It's OK if the dates do not make sense
    role: sample(WORKSPACE_MEMBER_ROLES),
    updatedAt: faker.date.recent({ days: 500 }),
    userId: user.id,
    workspaceId: workspace.id,
    ...params,
  }
}
