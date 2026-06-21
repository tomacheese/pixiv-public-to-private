import { Logger } from '@book000/node-utils'
import fs from 'node:fs'
import { BaseConverter } from './converters/base'
import { IllustBookmarksConverter } from './converters/illust-bookmarks'
import { NovelBookmarksConverter } from './converters/novel-bookmarks'
import { PixivClient } from '@book000/pixivts'
import { FollowingConverter } from './converters/following'

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

async function getPixivClient(inputRefreshToken: string): Promise<PixivClient> {
  const logger = Logger.configure('getPixivClient')
  try {
    const pixivClient = await PixivClient.of(inputRefreshToken)
    return pixivClient
  } catch (error) {
    logger.error(
      `🚨 Failed to initialize pixiv client: ${error instanceof Error ? error.message : String(error)}`
    )
    throw error
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

  const pixivClient = await getPixivClient(inputRefreshToken)

  fs.writeFileSync(
    tokenPath,
    JSON.stringify({
      access_token: pixivClient.getAccessToken(),
      user: {
        id: pixivClient.userId,
      },
      refresh_token: pixivClient.getRefreshToken(),
    })
  )

  return pixivClient
}

async function main() {
  const logger = Logger.configure('main')

  const pixivClient = await getPixiv()
  if (!pixivClient) {
    logger.error(`🚨 Failed to get Pixiv instance`)
    process.exitCode = 1
    return
  }
  const pixivUserId = pixivClient.userId
  logger.info(`📝 PIXIV_USER_ID: ${pixivUserId}`)

  const isDeleteBookmarkForDeleted =
    process.env.DELETE_BOOKMARK_FOR_DELETED_ITEMS === 'true'
  if (isDeleteBookmarkForDeleted) {
    logger.info(
      '🗑️ If the bookmarked item has been deleted, delete the bookmark.'
    )
  }

  const converters: BaseConverter<unknown>[] = [
    new IllustBookmarksConverter(pixivClient, isDeleteBookmarkForDeleted),
    new NovelBookmarksConverter(pixivClient, isDeleteBookmarkForDeleted),
    new FollowingConverter(pixivClient, isDeleteBookmarkForDeleted),
  ]

  for (const converter of converters) {
    try {
      await converter.run()
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === 'PixivRateLimitExceededError'
      ) {
        logger.error(`🚨 Rate limit exceeded: ${error.message}`)
        process.exitCode = 1
        return
      }
      logger.error(
        `🚨 Error occurred in converter ${converter.constructor.name}: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
      process.exitCode = 1
      // Continue to the next converter instead of exiting immediately
    }
  }
}

;(async () => {
  await main()
})()
