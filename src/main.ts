import { Pixiv } from '@book000/pixivts'
import { Logger } from '@book000/node-utils'
import fs from 'node:fs'
import { BaseConverter } from './converters/base'
import { IllustBookmarksConverter } from './converters/illust-bookmarks'
import { NovelBookmarksConverter } from './converters/novel-bookmarks'

function isJSON(value: string): boolean {
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

function isValidTokenJSON(data: object): data is { refresh_token: string } {
  try {
    if (typeof data !== 'object') {
      return false
    }
    if ('refresh_token' in data) {
      return true
    }
    return false
  } catch {
    return false
  }
}

async function getPixiv() {
  const logger = Logger.configure('getPixiv')
  const tokenPath = process.env.PIXIV_TOKEN_PATH ?? 'data/token.json'
  if (!fs.existsSync(tokenPath)) {
    logger.error(`🚨 Token file does not exist: ${tokenPath}`)
    return
  }

  const tokenRaw = fs.readFileSync(tokenPath, 'utf8')
  if (!isJSON(tokenRaw)) {
    logger.error(`🚨 Token file is not JSON: ${tokenPath}`)
    return
  }
  const tokenData = JSON.parse(tokenRaw)
  if (!isValidTokenJSON(tokenData)) {
    logger.error(`🚨 Token file is not valid: ${tokenPath}`)
    return
  }

  const inputRefreshToken = tokenData.refresh_token
  if (!inputRefreshToken) {
    logger.error(`🚨 Refresh token is not defined: ${tokenPath}`)
    return
  }

  const isEnabledResponseSave = !!process.env.RESPONSE_DB_HOSTNAME
  const pixiv = await Pixiv.of(inputRefreshToken, {
    debugOptions: {
      outputResponse: {
        enable: isEnabledResponseSave,
      },
    },
  })

  fs.writeFileSync(
    tokenPath,
    JSON.stringify({
      access_token: pixiv.accessToken,
      user: {
        id: pixiv.userId,
      },
      refresh_token: pixiv.refreshToken,
    })
  )

  return pixiv
}

async function main() {
  const logger = Logger.configure('main')

  const pixiv = await getPixiv()
  if (!pixiv) {
    logger.error(`🚨 Failed to get Pixiv instance`)
    process.exitCode = 1
    return
  }
  const pixivUserId = pixiv.userId
  logger.info(`📝 PIXIV_USER_ID: ${pixivUserId}`)

  const isDeleteBookmarkForDeleted =
    process.env.DELETE_BOOKMARK_FOR_DELETED_ITEMS === 'true'
  if (isDeleteBookmarkForDeleted) {
    logger.info(
      '🗑️ If the bookmarked item has been deleted, delete the bookmark.'
    )
  }

  const converters: BaseConverter<unknown>[] = [
    new IllustBookmarksConverter(pixiv, isDeleteBookmarkForDeleted),
    new NovelBookmarksConverter(pixiv, isDeleteBookmarkForDeleted),
  ]

  try {
    for (const converter of converters) {
      await converter.run()
    }
  } finally {
    await pixiv.close()
  }
}

;(async () => {
  await main()
})()
