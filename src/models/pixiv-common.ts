/**
 * 作品の画像URL群
 *
 * 単一画像の場合、オリジナル画像へは MetaSinglePage.original_image_url から取得
 *
 * 画像へのアクセスは適切なリファラを付与する必要がある
 */
export interface ImageUrls {
  /** 360x360 */
  square_medium: string
  /** 長辺が最大 540px */
  medium: string
  /** 横幅が最大 600px, 縦幅が最大 1200px */
  large: string
  /**
   * オリジナル画像
   *
   * MetaPages.image_urls の場合のみ存在？
   */
  original?: string
}

/**
 * プロフィール画像URL群
 */
export interface ProfileImageUrls {
  /** 中サイズ */
  medium: string
}

/**
 * ユーザー情報
 */
export interface PixivUser {
  /** ユーザー内部 ID */
  id: number

  /** ユーザー名 */
  name: string

  /** pixiv ID (URLに使用) */
  account: string

  /** プロフィール画像URL群 */
  profile_image_urls: ProfileImageUrls

  /** フォローしているかどうか */
  is_followed: boolean

  /** アクセスをブロックしているユーザーであるか */
  is_access_blocking_user: boolean
}

/**
 * タグ情報
 */
export interface Tag {
  /** タグ名 */
  name: string

  /** 翻訳済みタグ名 */
  translated_name: null | string

  /** 投稿者によって追加されたタグかどうか */
  added_by_uploaded_user?: boolean
}

/**
 * シリーズ情報
 */
export interface Series {
  /** シリーズ ID */
  id: number

  /** シリーズ名 */
  title: string
}
