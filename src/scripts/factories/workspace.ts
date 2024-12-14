import { faker } from '@faker-js/faker'
import sample from 'lodash/sample.js'
import { generateId } from '../../common/generate-id.js'
import { type Workspace, WORKSPACE_STATUSES } from '../../data/models/workspace.js'

export function buildWorkspace(params?: Partial<Workspace>): Workspace {
  return {
    createdAt: faker.date.past({ years: 15 }),
    id: generateId('workspace'),
    name: faker.word.words({ count: 3 }),
    status: sample(WORKSPACE_STATUSES),
    updatedAt: faker.date.recent({ days: 500 }),
    ...params,
  }
}
