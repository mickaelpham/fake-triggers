import { logger } from '../common/logger.js'
import { createIndexes, mongo } from '../data/providers/mongo.js'

createIndexes()
  .then(() => { mongo.close() })
  .catch((ex) => { logger.error(ex) })
