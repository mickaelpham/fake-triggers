import { logger } from '../common/logger.js'
import { createIndexes, dropDatabase, modifyCollectionsAndParams, mongo } from '../data/providers/mongo.js'

async function prepareDatabase() {
  await dropDatabase()
  await createIndexes()
  await modifyCollectionsAndParams()
  await mongo.close()
}

prepareDatabase().catch(logger.error)
