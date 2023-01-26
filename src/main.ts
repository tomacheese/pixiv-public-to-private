/* eslint-disable unicorn/no-null */
import { loadPixiv } from './pixiv'
import fs from 'node:fs'
import { PATH } from './config'

function getTargetUserId() {
  // config.json の user_id か、環境変数の PIXIV_USER_ID から取る
  // 環境変数 PIXIV_USER_ID を優先する

  const config = fs.existsSync(PATH.CONFIG_FILE)
    ? JSON.parse(fs.readFileSync(PATH.CONFIG_FILE, 'utf8'))
    : {}
  const userId = process.env.PIXIV_USER_ID || config.user_id
  if (!userId) {
    throw new Error('user_id is not defined')
  }
  return userId
}

async function main() {
  const pixiv = await loadPixiv()
  const userId = getTargetUserId()

  const bookmarkIllusts = await pixiv.getIllustBookmarks({
    userId,
    restrict: 'public',
  })
  if (bookmarkIllusts.status !== 200) {
    throw new Error(
      `Failed to get illust bookmarks: ${bookmarkIllusts.status} ${bookmarkIllusts.data}`
    )
  }
  for (const illust of bookmarkIllusts.data.illusts) {
    console.log(`[Illust] ${illust.title} ${illust.id}`)

    const result = await pixiv.addIllustBookmark({
      illustId: illust.id.toString(),
      restrict: 'private',
    })
    if (result.status !== 200) {
      console.error(
        `Failed to add illust bookmark: ${result.status} ${result.data}`
      )
    }
  }

  const bookmarkNovels = await pixiv.getNovelBookmarks({
    userId,
    restrict: 'public',
  })
  if (bookmarkNovels.status !== 200) {
    throw new Error(
      `Failed to get novel bookmarks: ${bookmarkNovels.status} ${bookmarkNovels.data}`
    )
  }
  for (const novel of bookmarkNovels.data.novels) {
    console.log(`[Novel] ${novel.title} ${novel.id}`)

    const result = await pixiv.addNovelBookmark({
      novelId: novel.id.toString(),
      restrict: 'private',
    })
    if (result.status !== 200) {
      console.error(
        `Failed to add novel bookmark: ${result.status} ${result.data}`
      )
    }
  }
}

;(async () => {
  await main()
})()
