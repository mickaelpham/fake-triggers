import { faker } from '@faker-js/faker'
import sample from 'lodash/sample.js'
import { generateId } from '../../common/generate-id.js'
import { type Workspace, WORKSPACE_STATUSES } from '../../data/models/workspace.js'

export function buildWorkspace(params?: Partial<Workspace>): Workspace {
  return {
    id: generateId('workspace'),
    name: faker.word.words({ count: 3 }),
    createdAt: faker.date.past({ years: 15 }),
    updatedAt: faker.date.recent({ days: 500 }),
    status: sample(WORKSPACE_STATUSES),
    ...params,
  }
}
