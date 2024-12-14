import { logger } from '../common/logger.js'
import { COLLECTIONS } from '../data/providers/mongo.js'
import { onUsersUpdate } from '../triggers/users.js'
import {
  onWorkspaceMembersDelete,
  onWorkspaceMembersInsert,
  onWorkspaceMembersUpdate,
} from '../triggers/workspace-members.js'

function listenToChangeStreams() {
  const changeStreamWorkspaceMembers = COLLECTIONS.WORKSPACE_MEMBERS.watch(
    [],
    {
      fullDocumentBeforeChange: 'required',
      fullDocument: 'required',
    },
  )
  changeStreamWorkspaceMembers.on('change', (next) => {
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
        logger.debug({ operationType: next.operationType }, 'unhandled operation type for workspace_members')
    }
  })

  const changeStreamUsers = COLLECTIONS.USERS.watch(
    [],
    {
      fullDocumentBeforeChange: 'required',
      fullDocument: 'required',
    },
  )
  changeStreamUsers.on('change', (next) => {
    logger.info({ operationType: next.operationType }, 'event received for users')
    switch (next.operationType) {
      case 'update':
        onUsersUpdate(next.fullDocument!)
        break
      default:
        logger.debug({ operationType: next.operationType }, 'unhandled operation type for users')
    }
  })
}

listenToChangeStreams()
