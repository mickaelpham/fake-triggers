import type { Company } from '../../data/models/company.js'
import type { Group } from '../../data/models/group.js'
import type { Workspace } from '../../data/models/workspace.js'
import { faker } from '@faker-js/faker'
import sample from 'lodash/sample.js'
import { generateId } from '../../common/generate-id.js'
import { WORKSPACE_MEMBER_ROLES } from '../../data/models/workspace-member.js'

export function buildGroup(
  company: Pick<Company, 'id'>,
  workspaces: Array<Pick<Workspace, 'id'>>,
  params?: Partial<Group>,
): Group {
  return {
    companyId: company.id,
    createdAt: faker.date.past({ years: 15 }),
    id: generateId('group'),
    name: faker.word.words({ count: 3 }),
    updatedAt: faker.date.recent({ days: 500 }),
    workspaces: workspaces.map(workspace => ({
      workspaceId: workspace.id,
      role: sample(WORKSPACE_MEMBER_ROLES),
    })),
    ...params,
  }
}
