import { logger } from '../common/logger.js'
import { COLLECTIONS } from '../data/providers/mongo.js'
import { onWorkspaceMembersDelete, onWorkspaceMembersInsert, onWorkspaceMembersUpdate } from '../triggers/workspace-members.js'

function listenToChangeStreams() {
  const changeStream = COLLECTIONS.WORKSPACE_MEMBERS.watch(
    [],
    {
      fullDocumentBeforeChange: 'required',
      fullDocument: 'required',
    },
  )
  changeStream.on('change', (next) => {
    logger.info({ operationType: next.operationType }, 'event received for workspace_members')
    switch (next.operationType) {
      case 'insert':
        onWorkspaceMembersInsert(next.fullDocument)
        break
      case 'update':
        onWorkspaceMembersUpdate(next.fullDocument!, next.updateDescription)
        break
      case 'delete':
        onWorkspaceMembersDelete(next.fullDocumentBeforeChange!)
        break
      default:
        logger.debug({ operationType: next.operationType }, 'unhandled operation type')
    }
  })
}

listenToChangeStreams()
