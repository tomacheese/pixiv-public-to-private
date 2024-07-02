import { BookmarkRestrict, Pixiv } from '@book000/pixivts'
import { Logger } from '@book000/node-utils'
import fs from 'node:fs'

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

  // Illusts
  const publicBookmarkIllusts = await pixiv.userBookmarksIllust({
    userId: Number(pixivUserId),
    restrict: BookmarkRestrict.PUBLIC,
  })
  if (publicBookmarkIllusts.status !== 200) {
    logger.error(
      `🚨 Failed to get public bookmark illusts: ${publicBookmarkIllusts.status}`
    )
    logger.error(JSON.stringify(publicBookmarkIllusts.data))
    process.exitCode = 1
    return
  }

  const illusts = publicBookmarkIllusts.data.illusts
  logger.info(`🖼️ Public illust bookmarks: ${illusts.length}`)
  for (const illust of illusts) {
    logger.info(`🖼️ Illust: ${illust.title} (${illust.id})`)

    const result = await pixiv.illustBookmarkAdd({
      illustId: illust.id,
      restrict: BookmarkRestrict.PRIVATE,
    })

    if (result.status === 404) {
      // If the illust is not found, skip it
      logger.error(`🚨 Illust not found: ${illust.id}`)
      continue
    } else if (result.status !== 200) {
      // If the request failed, log the error and continue
      logger.error(`🚨 Failed to add bookmark: ${result.status}`)
      logger.error(JSON.stringify(result.data))
      process.exitCode = 1
      continue
    }
  }

  // Novels
  const publicBookmarkNovels = await pixiv.userBookmarksNovel({
    userId: Number(pixivUserId),
    restrict: BookmarkRestrict.PUBLIC,
  })
  if (publicBookmarkNovels.status !== 200) {
    logger.error(
      `🚨 Failed to get public bookmark novels: ${publicBookmarkNovels.status}`
    )
    logger.error(JSON.stringify(publicBookmarkNovels.data))
    process.exitCode = 1
    return
  }

  const novels = publicBookmarkNovels.data.novels
  logger.info(`📕 Public novel bookmarks: ${novels.length}`)
  for (const novel of novels) {
    logger.info(`📕 Novel: ${novel.title} (${novel.id})`)

    const result = await pixiv.novelBookmarkAdd({
      novelId: novel.id.toString(),
      restrict: BookmarkRestrict.PRIVATE,
    })
    if (result.status === 404) {
      // If the novel is not found, skip it
      logger.error(`🚨 Novel not found: ${novel.id}`)
      continue
    } else if (result.status !== 200) {
      // If the request failed, log the error and continue
      logger.error(`🚨 Failed to add bookmark: ${result.status}`)
      logger.error(JSON.stringify(result.data))
      process.exitCode = 1
      continue
    }
  }

  await pixiv.close()
}

;(async () => {
  await main()
})()
