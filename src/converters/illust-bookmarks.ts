import {
  BookmarkRestrict,
  parseNextUrl,
  PixivIllustItem,
} from '@book000/pixivts'
import { BaseConverter, ConvertResult, FetchPageResult } from './base'
import { PixivRateLimitExceededError } from '../exceptions'

/**
 * Converter for illustration bookmarks. It fetches public illustration bookmarks and makes them private. If the illustration has been deleted, it can optionally delete the bookmark as well.
 */
export class IllustBookmarksConverter extends BaseConverter<PixivIllustItem> {
  protected readonly itemTypeName = 'ILLUST_BOOKMARKS'
  protected readonly isDefaultEnabled = true

  protected async fetchPage(
    maxId?: number
  ): Promise<FetchPageResult<PixivIllustItem> | null> {
    const result = await this.pixivClient.users.bookmarks.illusts({
      userId: this.pixivClient.userId,
      restrict: BookmarkRestrict.PUBLIC,
      maxBookmarkId: maxId,
    })

    if (result.isErr) {
      this.logger.error(
        `🚨 Failed to get public bookmark illusts: ${result.error.type}`
      )
      if (result.error.type === 'api_error') {
        this.logger.error(
          `🚨 API error - statusCode: ${result.error.status}, body: ${JSON.stringify(result.error.body)}`
        )
      }
      return null
    }

    this.logger.info(
      `🖼️ Public illust bookmarks: ${result.value.illusts.length}`
    )

    const nextUrl = result.value.nextUrl
    const nextMaxId = nextUrl ? parseNextUrl(nextUrl).maxBookmarkId : undefined

    return {
      items: result.value.illusts,
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
    const result = await this.pixivClient.illusts.bookmarkAdd({
      illustId: item.id,
      restrict: 'private',
    })
    if (result.isErr) {
      if (result.error.type === 'rate_limit') {
        throw new PixivRateLimitExceededError(
          `Rate limit exceeded while adding bookmark for illust ${item.id}`
        )
      }
      return {
        status: result.error.type === 'api_error' ? result.error.status : 500,
        data:
          result.error.type === 'api_error' ? result.error.body : result.error,
      }
    }
    return {
      status: 200,
      data: result.value,
    }
  }

  protected async removeForDeletedItem(item: PixivIllustItem): Promise<void> {
    await this.pixivClient.illusts.bookmarkDelete({
      illustId: item.id,
    })
  }
}
