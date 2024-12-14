import type { Group } from '../data/models/group.js'
import { logger } from '../common/logger.js'

export async function onGroupsUpdate(fullDocument: Group) {
  logger.info({ fullDocument }, 'onGroupsUpdate')
}
