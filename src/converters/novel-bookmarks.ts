import { BookmarkRestrict, Pixiv, PixivNovelItem } from '@book000/pixivts'
import { BaseConverter, ConvertResult, FetchPageResult } from './base'

/**
 * Converter for novel bookmarks. It fetches public novel bookmarks and makes them private. If the novel has been deleted, it can optionally delete the bookmark as well.
 */
export class NovelBookmarksConverter extends BaseConverter<PixivNovelItem> {
  protected async fetchPage(
    maxId?: number
  ): Promise<FetchPageResult<PixivNovelItem> | null> {
    const response = await this.pixiv.userBookmarksNovel({
      userId: Number(this.pixiv.userId),
      restrict: BookmarkRestrict.PUBLIC,
      maxBookmarkId: maxId,
    })

    if (response.status !== 200) {
      this.logger.error(
        `🚨 Failed to get public bookmark novels: ${response.status}`
      )
      this.logger.error(JSON.stringify(response.data))
      return null
    }

    this.logger.info(
      `🖼️ Public novel bookmarks: ${response.data.novels.length}`
    )

    const nextUrl = response.data.next_url
    const nextMaxId = nextUrl
      ? Number(Pixiv.parseQueryString(nextUrl).max_bookmark_id)
      : undefined

    return {
      items: response.data.novels,
      nextMaxId,
    }
  }

  protected describe(item: PixivNovelItem): string {
    return `📕 Novel: ${item.title} (${item.id})`
  }

  protected async toPrivate(item: PixivNovelItem): Promise<ConvertResult> {
    return this.pixiv.novelBookmarkAdd({
      novelId: item.id.toString(),
      restrict: BookmarkRestrict.PRIVATE,
    })
  }

  protected async removeForDeletedItem(item: PixivNovelItem): Promise<void> {
    await this.pixiv.novelBookmarkDelete({
      novelId: item.id.toString(),
    })
  }
}
