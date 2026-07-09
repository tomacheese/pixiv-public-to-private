import { Logger } from '@book000/node-utils'
import { PixivClient } from '@book000/pixivts'

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
  /** Response status code */
  status: number
  /** Response body */
  data: unknown
}

/**
 * BaseConverter is an abstract class that serves as a template for specific converters that handle different types of Pixiv items (e.g., illustrations, novels).
 */
export abstract class BaseConverter<T> {
  /**
   * Pixiv API client instance
   */
  protected readonly pixivClient: PixivClient

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
   * @param pixivClient Pixiv API client instance
   * @param isDeleteForDeletedItems Whether to delete bookmarks for items that have been deleted on Pixiv
   */
  constructor(pixivClient: PixivClient, isDeleteForDeletedItems: boolean) {
    this.pixivClient = pixivClient
    this.isDeleteForDeletedItems = isDeleteForDeletedItems

    this.logger = Logger.configure(this.constructor.name)
  }

  /**
   * Item type name used in log messages and enable function environment variable
   *
   * @example "ILLUST_BOOKMARKS", "NOVEL_BOOKMARKS"
   */
  protected abstract readonly itemTypeName: string

  /** Whether this converter is enabled by default. */
  protected abstract readonly isDefaultEnabled: boolean

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

  /**
   * Fetches public bookmarks page by page and converts each item to private.
   * Sets `process.exitCode = 1` if a page fetch or item conversion fails.
   */
  async run(): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.info(`⚠️ Converter is disabled. Skipping.`)
      return
    }

    try {
      let maxId: number | undefined
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
          } else if (result.status !== 200) {
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
      if (
        error instanceof Error &&
        error.name === 'PixivRateLimitExceededError'
      ) {
        throw error
      }
      this.logger.error(`🚨 Unexpected error`, error as Error)
      process.exitCode = 1
    }
  }

  /**
   * Determines whether this converter is enabled based on environment variables.
   * The environment variable should be in the format `ENABLE_{ITEM_TYPE_NAME}_CONVERTER` (e.g., `ENABLE_ILLUST_BOOKMARKS_CONVERTER`).
   * If the environment variable is not set, it falls back to the `IsDefaultEnabled` property.
   *
   * @returns A boolean indicating whether this converter is enabled.
   */
  private isEnabled(): boolean {
    const envVarName = `ENABLE_${this.itemTypeName.toUpperCase()}_CONVERTER`
    const envVarValue = process.env[envVarName]
    if (!envVarValue) {
      // If the environment variable is not set, use IsDefaultEnabled
      return this.isDefaultEnabled
    }

    const truthyValues = ['true', '1', 'yes']
    return truthyValues.includes(envVarValue.toLowerCase())
  }
}
