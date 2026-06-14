import { BookmarkRestrict, Pixiv, PixivNovelItem } from '@book000/pixivts'
import { BaseConverter, ConvertResult, FetchPageResult } from './base'

/**
 * FollowConverter handles the conversion of public novel bookmarks to private ones.
 */
export class FollowConverter extends BaseConverter<PixivNovelItem> {
  protected async fetchPage(
    maxId?: number
  ): Promise<FetchPageResult<PixivNovelItem> | null> {
    throw new Error('FollowConverter does not support fetching pages.')
  }

  protected describe(item: PixivNovelItem): string {
    throw new Error('FollowConverter does not support describing items.')
  }

  protected async toPrivate(item: PixivNovelItem): Promise<ConvertResult> {
    throw new Error('FollowConverter does not support converting items to private.')
  }

  protected async removeForDeletedItem(item: PixivNovelItem): Promise<void> {
    throw new Error('FollowConverter does not support removing deleted items.')
  }
}
