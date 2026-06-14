import { BookmarkRestrict, Pixiv, PixivIllustItem } from '@book000/pixivts'
import { BaseConverter, ConvertResult, FetchPageResult } from './base'

/**
 * Converter for illustration bookmarks. It fetches public illustration bookmarks and makes them private. If the illustration has been deleted, it can optionally delete the bookmark as well.
 */
export class IllustBookmarksConverter extends BaseConverter<PixivIllustItem> {
  protected readonly itemTypeName = 'Illust'

  protected async fetchPage(
    maxId?: number
  ): Promise<FetchPageResult<PixivIllustItem> | null> {
    const response = await this.pixiv.userBookmarksIllust({
      userId: Number(this.pixiv.userId),
      restrict: BookmarkRestrict.PUBLIC,
      maxBookmarkId: maxId,
    })

    if (response.status !== 200) {
      this.logger.error(
        `🚨 Failed to get public bookmark illusts: ${response.status}`
      )
      this.logger.error(JSON.stringify(response.data))
      return null
    }

    this.logger.info(
      `🖼️ Public illust bookmarks: ${response.data.illusts.length}`
    )

    const nextUrl = response.data.next_url
    const nextMaxId = nextUrl
      ? Number(Pixiv.parseQueryString(nextUrl).max_bookmark_id)
      : undefined

    return {
      items: response.data.illusts,
      nextMaxId: Number.isFinite(nextMaxId) ? nextMaxId : undefined,
    }
  }

  protected describe(item: PixivIllustItem): string {
    return `🖼️ Illust: ${item.title} (${item.id})`
  }

  protected getId(item: PixivIllustItem): number {
    return item.id
  }

  protected async toPrivate(item: PixivIllustItem): Promise<ConvertResult> {
    return this.pixiv.illustBookmarkAdd({
      illustId: item.id,
      restrict: BookmarkRestrict.PRIVATE,
    })
  }

  protected async removeForDeletedItem(item: PixivIllustItem): Promise<void> {
    await this.pixiv.illustBookmarkDelete({
      illustId: item.id.toString(),
    })
  }
}
