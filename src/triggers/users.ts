import type { User } from '../data/models/user.js'
import { getUserFullName } from '../common/get-user-full-name.js'
import { logger } from '../common/logger.js'
import { COLLECTIONS } from '../data/providers/mongo.js'

export async function onUsersUpdate(fullDocument: User) {
  logger.info({ fullDocument }, 'onUsersUpdate')

  await COLLECTIONS.SEARCH_WORKSPACE_MEMBERS.updateMany(
    { userId: fullDocument.id },
    {
      $set: {
        email: fullDocument.email,
        fullName: getUserFullName(fullDocument),
        userCompanyId: fullDocument.companyId,
        userLicense: fullDocument.license,
      },
    },
    { ignoreUndefined: true },
  )
}
