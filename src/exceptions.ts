export class PixivRateLimitExceededError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PixivRateLimitExceededError'
  }
}
