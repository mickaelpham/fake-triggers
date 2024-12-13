import { logger } from '../common/logger.js'
import { COLLECTIONS } from '../data/providers/mongo.js'

function listenToChangeStreams() {
  const changeStream = COLLECTIONS.WORKSPACE_MEMBERS.watch()
  changeStream.on('change', (next) => {
    logger.info({ next }, 'hello from change stream')
  })
}

listenToChangeStreams()
