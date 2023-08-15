// @see https://github.com/tomacheese/my-pixiv/blob/master/api/src/pixiv/pixiv.ts

import axios, { AxiosInstance, AxiosResponse } from 'axios'
import qs from 'qs'
import crypto from 'node:crypto'
import { PATH } from './config'
import fs from 'node:fs'
import { PixivIllustItem } from './models/pixiv-illust'
import { PixivNovelItem } from './models/pixiv-novel'

interface GetIllustBookmarksOptions {
  userId: string
  restrict: 'public' | 'private'
}

interface GetIllustBookmarksApiResponse {
  illusts: PixivIllustItem[]
}

interface GetNovelBookmarksOptions {
  userId: string
  restrict: 'public' | 'private'
}

interface GetNovelBookmarksApiResponse {
  novels: PixivNovelItem[]
}

interface AddIllustBookmarkOptions {
  illustId: string
  restrict: 'public' | 'private'
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AddIllustBookmarksApiResponse {}

interface AddNovelBookmarkOptions {
  novelId: string
  restrict: 'public' | 'private'
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AddNovelBookmarksApiResponse {}

interface RequestOptions {
  method: 'GET' | 'POST'
  path: string
  params?: Record<string, any>
  data?: Record<string, any>
}

export class Pixiv {
  private static clientId = 'MOBrBDS8blbauoSck0ZfDbtuzpyT'
  private static clientSecret = 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj'
  private static hashSecret =
    '28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c'

  private hosts = 'https://app-api.pixiv.net'

  readonly userId: string
  readonly accessToken: string
  readonly refreshToken: string
  readonly axios: AxiosInstance

  /**
   * コンストラクタ。外部からインスタンス化できないので、of メソッドを使うこと。
   *
   * @param userId ユーザー ID
   * @param accessToken アクセストークン
   * @param refreshToken リフレッシュトークン
   */
  private constructor(
    userId: string,
    accessToken: string,
    refreshToken: string,
  ) {
    this.userId = userId
    this.accessToken = accessToken
    this.refreshToken = refreshToken

    this.axios = axios.create({
      baseURL: this.hosts,
      headers: {
        Host: 'app-api.pixiv.net',
        'App-OS': 'ios',
        'App-OS-Version': '14.6',
        'User-Agent': 'PixivIOSApp/7.13.3 (iOS 14.6; iPhone13,2)',
        Authorization: `Bearer ${this.accessToken}`,
      },
      validateStatus: () => true,
    })
  }

  /**
   * リフレッシュトークンからインスタンスを生成する。
   *
   * @param refreshToken リフレッシュトークン
   * @returns Pixiv インスタンス
   */
  public static async of(refreshToken: string) {
    // @see https://github.com/upbit/pixivpy/blob/master/pixivpy3/api.py#L120

    // UTCで YYYY-MM-DDTHH:mm:ss+00:00 の形式で現在時刻を取得
    const localTime = new Date().toISOString().replace(/Z$/, '+00:00')

    const headers = {
      'x-client-time': localTime,
      'x-client-hash': this.hash(localTime),
      'app-os': 'ios',
      'app-os-version': '14.6',
      'user-agent': 'PixivIOSApp/7.13.3 (iOS 14.6; iPhone13,2)',
      header: 'application/x-www-form-urlencoded',
    }

    const authUrl = 'https://oauth.secure.pixiv.net/auth/token'

    const data = qs.stringify({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      get_secure_url: 1,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })

    const response = await axios.post(authUrl, data, {
      headers,
      validateStatus: () => true,
    })

    if (response.status !== 200) {
      throw new Error('Failed to refresh token')
    }

    const options = {
      userId: response.data.user.id,
      accessToken: response.data.response.access_token,
      refreshToken: response.data.response.refresh_token,
    }

    return new Pixiv(options.userId, options.accessToken, options.refreshToken)
  }

  public async getIllustBookmarks(options: GetIllustBookmarksOptions) {
    const parameters = {
      user_id: options.userId,
      restrict: options.restrict,
    }

    return this.request<GetIllustBookmarksApiResponse>({
      method: 'GET',
      path: '/v1/user/bookmarks/illust',
      params: parameters,
    })
  }

  public async getNovelBookmarks(options: GetNovelBookmarksOptions) {
    const parameters = {
      user_id: options.userId,
      restrict: options.restrict,
    }

    return this.request<GetNovelBookmarksApiResponse>({
      method: 'GET',
      path: '/v1/user/bookmarks/novel',
      params: parameters,
    })
  }

  public async addIllustBookmark(options: AddIllustBookmarkOptions) {
    const data = {
      illust_id: options.illustId,
      restrict: options.restrict,
    }

    return this.request<AddIllustBookmarksApiResponse>({
      method: 'POST',
      path: '/v2/illust/bookmark/add',
      data,
    })
  }

  public async addNovelBookmark(options: AddNovelBookmarkOptions) {
    const data = {
      novel_id: options.novelId,
      restrict: options.restrict,
    }

    return this.request<AddNovelBookmarksApiResponse>({
      method: 'POST',
      path: '/v2/novel/bookmark/add',
      data,
    })
  }

  /**
   * MD5ハッシュを生成する。
   *
   * @param str 文字列
   * @returns ハッシュ
   */
  // eslint-disable-next-line unicorn/prevent-abbreviations
  private static hash(str: string) {
    const hash = crypto.createHash('md5')
    return hash.update(str + this.hashSecret).digest('hex')
  }

  /**
   * リクエストを送信する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  private request<T>(options: RequestOptions): Promise<AxiosResponse<T>> {
    if (options.method === 'GET') {
      return this.axios.get<T>(options.path, { params: options.params })
    }
    if (options.method === 'POST') {
      return this.axios.post<T>(options.path, qs.stringify(options.data), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
    }
    throw new Error('Invalid method')
  }
}

/**
 * Pixivインスタンスのキャッシュ
 */
const cache: {
  pixiv: Pixiv | undefined
  timestamp: number
} = {
  pixiv: undefined,
  timestamp: 0,
}

/**
 * Pixivインスタンスを取得する。インスタンスは10分間キャッシュされる。
 *
 * @returns Pixivインスタンス
 */
export async function loadPixiv() {
  // 10分以内に呼ばれたらキャッシュを返す
  if (cache.pixiv && cache.timestamp + 10 * 60 * 1000 > Date.now()) {
    return cache.pixiv
  }

  const data = fs.readFileSync(PATH.TOKEN_FILE, 'utf8')
  const json = JSON.parse(data)
  const pixiv = await Pixiv.of(json.refresh_token)
  if (json.refresh_token !== pixiv.refreshToken) {
    fs.writeFileSync(
      PATH.TOKEN_FILE,
      JSON.stringify(
        {
          refresh_token: pixiv.refreshToken,
          datetime: new Date().toISOString(),
        },
        // eslint-disable-next-line unicorn/no-null
        null,
        2,
      ),
    )
  }

  cache.pixiv = pixiv
  cache.timestamp = Date.now()

  return pixiv
}
