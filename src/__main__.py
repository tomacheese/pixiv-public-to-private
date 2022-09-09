from src import add_illust_bookmark, add_novel_bookmark, get_illust_bookmarks, get_novel_bookmarks, init_pixiv_api


def main():
    api = init_pixiv_api()

    bookmark_illusts = get_illust_bookmarks(api)
    for bookmark_illust in bookmark_illusts:
        print("[ILLUST]", bookmark_illust['title'], bookmark_illust['id'])

        add_illust_bookmark(api, bookmark_illust['id'], 'private')

    bookmark_novels = get_novel_bookmarks(api)
    for bookmark_novel in bookmark_novels:
        print("[NOVEL]", bookmark_novel['title'], bookmark_novel['id'])

        add_novel_bookmark(api, bookmark_novel['id'], 'private')


if __name__ == '__main__':
    main()
