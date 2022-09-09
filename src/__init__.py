import json
import os
from typing import Literal

from pixivpy3 import AppPixivAPI

TOKEN_FILE = os.environ.setdefault('PIXIVPY_TOKEN_FILE', '/data/token.json')
CONFIG_FILE = os.environ.setdefault('CONFIG_FILE', '/data/config.json')


def get_config():
    with open(CONFIG_FILE, 'r') as f:
        return json.load(f)


def init_pixiv_api() -> AppPixivAPI:
    api = AppPixivAPI()

    if not os.path.exists(TOKEN_FILE):
        raise Exception('Token file not found')

    with open(TOKEN_FILE, 'r') as f:
        prev = json.load(f)
        token = api.auth(None, None, prev["refresh_token"])
    with open(TOKEN_FILE, "w", encoding="utf-8") as f:
        f.write(json.dumps(token))

    return api


def get_illust_bookmarks(api: AppPixivAPI, restrict: Literal['public', 'private'] = 'public'):
    config = get_config()
    bookmarks = api.user_bookmarks_illust(config['user_id'], restrict)
    if "illusts" not in bookmarks:
        raise Exception("Failed to get bookmarked illusts")

    return bookmarks["illusts"]


def get_novel_bookmarks(api: AppPixivAPI, restrict: Literal['public', 'private'] = 'public'):
    config = get_config()
    url = "%s/v1/user/bookmarks/novel" % api.hosts
    params = {
        "user_id": config['user_id'],
        "restrict": restrict
    }
    r = api.no_auth_requests_call("GET", url, params=params, req_auth=True)
    bookmarks = api.parse_result(r)
    if "novels" not in bookmarks:
        raise Exception("Failed to get bookmarked novels")

    return bookmarks["novels"]


def add_illust_bookmark(api: AppPixivAPI, illust_id: int | str, restrict: Literal['public', 'private'] = 'public'):
    api.illust_bookmark_add(illust_id, restrict)


def add_novel_bookmark(api: AppPixivAPI, illust_id: int | str, restrict: Literal['public', 'private'] = 'public'):
    url = "%s/v2/novel/bookmark/add" % api.hosts
    data = {
        "novel_id": illust_id,
        "restrict": restrict,
    }

    r = api.no_auth_requests_call("POST", url, data=data, req_auth=True)
    return api.parse_result(r)
