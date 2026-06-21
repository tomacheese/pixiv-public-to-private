import { FollowRestrict, PixivUserPreviewItem } from '@book000/pixivts'
import { BaseConverter, ConvertResult, FetchPageResult } from './base'
import { PixivRateLimitExceededError } from '../exceptions'

/**
 * Converter for following users. It fetches publicly followed users and changes the follow visibility to private. If the followed account has been deleted, it can optionally unfollow as well.
 */
export class FollowingConverter extends BaseConverter<PixivUserPreviewItem> {
  protected readonly itemTypeName = 'FOLLOWING'
  protected readonly IsDefaultEnabled = false

  /** User IDs from the previous page, used to detect a stalled page below. */
  private previousPageUserIds: number[] | undefined

  /**
   * `users.following` only has an offset cursor, not a max-ID one.
   * Since toPrivate() removes users from the public list as we go, trusting the API's next_url offset would skip whoever shifted to the front so we just keep re-fetching offset 0 and bail out if a page stops shrinking.
   * 
   * @returns 0 = next page is offset 0 with some users, undefined = no more pages or failed to fetch
   */
  protected async fetchPage(): Promise<FetchPageResult<PixivUserPreviewItem> | null> {
    const result = await this.pixivClient.users.following({
      userId: this.pixivClient.userId,
      restrict: FollowRestrict.PUBLIC,
      offset: 0,
    })

    if (result.isErr) {
      this.logger.error(
        `🚨 Failed to get public following users: ${result.error.type}`
      )
      if (result.error.type === 'api_error') {
        this.logger.error(
          `🚨 API error - statusCode: ${result.error.status}, body: ${JSON.stringify(result.error.body)}`
        )
      }
      return null
    }

    const userPreviews = result.value.userPreviews
    this.logger.info(`👤 Public following users: ${userPreviews.length}`)

    if (userPreviews.length === 0) {
      return {
        items: [],
        nextMaxId: undefined,
      }
    }

    const currentPageUserIds = userPreviews.map((preview) => preview.user.id)
    if (
      this.previousPageUserIds &&
      this.isSameUserIdSet(this.previousPageUserIds, currentPageUserIds)
    ) {
      // Same users as last time means none of them actually went private -
      // retrying offset 0 forever won't help, so give up.
      this.logger.error(
        `🚨 Stuck on the same following users, giving up: ${currentPageUserIds.join(', ')}`
      )
      return null
    }
    this.previousPageUserIds = currentPageUserIds

    return {
      items: userPreviews,
      nextMaxId: 0,
    }
  }

  protected describe(item: PixivUserPreviewItem): string {
    return `👤 User: ${item.user.name} (${item.user.id})`
  }

  protected getId(item: PixivUserPreviewItem): number {
    return item.user.id
  }

  protected async toPrivate(
    item: PixivUserPreviewItem
  ): Promise<ConvertResult> {
    const result = await this.pixivClient.users.followAdd({
      userId: item.user.id,
      restrict: FollowRestrict.PRIVATE,
    })
    if (result.isErr) {
      if (result.error.type === 'rate_limit') {
        throw new PixivRateLimitExceededError(
          `Rate limit exceeded while updating follow restrict for user ${item.user.id}`
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

  protected async removeForDeletedItem(
    item: PixivUserPreviewItem
  ): Promise<void> {
    await this.pixivClient.users.followDelete({
      userId: item.user.id,
    })
  }

  /** Whether two pages contain the exact same set of user IDs. */
  private isSameUserIdSet(previous: number[], current: number[]): boolean {
    if (previous.length !== current.length) {
      return false
    }
    const currentIds = new Set(current)
    return previous.every((id) => currentIds.has(id))
  }
}
