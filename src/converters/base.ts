import { Logger } from '@book000/node-utils'
import { Pixiv, PixivRateLimitError } from '@book000/pixivts'

/**
 * Result of fetching one page of items from Pixiv API.
 */
export interface FetchPageResult<T> {
  /** Fetched items */
  items: T[]
  /** Next page's max_id for pagination. If there are no more pages, it will be undefined. */
  nextMaxId?: number
}

/**
 * Result of converting an item (e.g., making a bookmark private).
 */
export interface ConvertResult {
  /** レスポンスステータスコード */
  status: number
  /** レスポンスボディ */
  data: unknown
}

/**
 * BaseConverter is an abstract class that serves as a template for specific converters that handle different types of Pixiv items (e.g., illustrations, novels).
 */
export abstract class BaseConverter<T> {
  /**
   * Pixiv API client instance
   */
  protected readonly pixiv: Pixiv

  /**
   * Whether to delete bookmarks for items that have been deleted on Pixiv
   */
  protected readonly isDeleteForDeletedItems: boolean

  /**
   * Logger instance for logging information and errors
   */
  protected readonly logger: Logger

  /**
   * Constructor for BaseConverter
   *
   * @param pixiv Pixiv API client instance
   * @param isDeleteForDeletedItems Whether to delete bookmarks for items that have been deleted on Pixiv
   */
  constructor(pixiv: Pixiv, isDeleteForDeletedItems: boolean) {
    this.pixiv = pixiv
    this.isDeleteForDeletedItems = isDeleteForDeletedItems

    this.logger = Logger.configure(this.constructor.name)
  }

  /** Item type name used in log messages (e.g. "Illust", "Novel") */
  protected abstract readonly itemTypeName: string

  /** Get one page of public items */
  protected abstract fetchPage(
    maxId?: number
  ): Promise<FetchPageResult<T> | null>

  /** Make the item a string for displaying logs */
  protected abstract describe(item: T): string

  /** Get the item's ID for displaying logs */
  protected abstract getId(item: T): number | string

  /** Make items private. Determine and return 404 (target deleted) */
  protected abstract toPrivate(item: T): Promise<ConvertResult>

  /** Removal process called when the target has already been deleted (cancellation of bookmarks/unfollowing, etc.) */
  protected abstract removeForDeletedItem(item: T): Promise<void>

  async run(): Promise<void> {
    let maxId: number | undefined
    try {
      while (true) {
        const page = await this.fetchPage(maxId)
        if (!page) {
          process.exitCode = 1
          return
        }

        for (const item of page.items) {
          this.logger.info(this.describe(item))
          const result = await this.toPrivate(item)

          if (result.status === 404) {
            this.logger.error(
              `🚨 ${this.itemTypeName} not found: ${this.getId(item)}`
            )
            if (this.isDeleteForDeletedItems) {
              this.logger.info(`🚨 Deleting bookmark: ${this.getId(item)}`)
              await this.removeForDeletedItem(item)
            }
            continue
          }
          if (result.status !== 200) {
            this.logger.error(`🚨 Failed to add bookmark: ${result.status}`)
            this.logger.error(JSON.stringify(result.data))
            process.exitCode = 1
          }
        }

        if (page.nextMaxId === undefined) break
        if (!Number.isFinite(page.nextMaxId)) {
          this.logger.error(`🚨 Invalid nextMaxId: ${page.nextMaxId}`)
          process.exitCode = 1
          return
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
        maxId = page.nextMaxId
      }
    } catch (error) {
      if (error instanceof PixivRateLimitError) {
        this.logger.error('🚨 Rate limit exceeded')
      }
      throw error
    }
  }
}
