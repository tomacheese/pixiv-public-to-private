import {
  BookmarkRestrict,
  parseNextUrl,
  PixivNovelItem,
} from '@book000/pixivts'
import { BaseConverter, ConvertResult, FetchPageResult } from './base'
import { PixivRateLimitExceededError } from '../exceptions'

/**
 * Converter for novel bookmarks. It fetches public novel bookmarks and makes them private. If the novel has been deleted, it can optionally delete the bookmark as well.
 */
export class NovelBookmarksConverter extends BaseConverter<PixivNovelItem> {
  protected readonly itemTypeName = 'NOVEL_BOOKMARKS'
  protected readonly isDefaultEnabled = true

  protected async fetchPage(
    maxId?: number
  ): Promise<FetchPageResult<PixivNovelItem> | null> {
    const result = await this.pixivClient.users.bookmarks.novels({
      userId: this.pixivClient.userId,
      restrict: BookmarkRestrict.PUBLIC,
      maxBookmarkId: maxId,
    })

    if (result.isErr) {
      this.logger.error(
        `🚨 Failed to get public bookmark novels: ${result.error.type}`
      )
      if (result.error.type === 'api_error') {
        this.logger.error(
          `🚨 API error - statusCode: ${result.error.status}, body: ${JSON.stringify(result.error.body)}`
        )
      }
      return null
    }

    this.logger.info(`📕 Public novel bookmarks: ${result.value.novels.length}`)

    const nextUrl = result.value.nextUrl
    const nextMaxId = nextUrl ? parseNextUrl(nextUrl).maxBookmarkId : undefined

    return {
      items: result.value.novels,
      nextMaxId: Number.isFinite(nextMaxId) ? nextMaxId : undefined,
    }
  }

  protected describe(item: PixivNovelItem): string {
    return `📕 Novel: ${item.title} (${item.id})`
  }

  protected getId(item: PixivNovelItem): number {
    return item.id
  }

  protected async toPrivate(item: PixivNovelItem): Promise<ConvertResult> {
    const result = await this.pixivClient.novels.bookmarkAdd({
      novelId: item.id,
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

  protected async removeForDeletedItem(item: PixivNovelItem): Promise<void> {
    await this.pixivClient.novels.bookmarkDelete({
      novelId: item.id,
    })
  }
}
