# pixiv-public-to-private

Changes all illustrations and novels publicly bookmarked on pixiv to private bookmarks. Public followings can also be made private (disabled by default).

This application is intended to change the visibility of bookmarks on an ongoing schedule.  
If you expect to make temporary batch changes, you can use the following script created in the browser devtool.

- [toggleAllRestrict.js - Gist](https://gist.github.com/book000/f300385613d2d78125fa86fa78432828)

## Requirements

- Docker Compose
- Valid pixiv refresh token: Please refer to these to retrieve
  - [Retrieving Auth Token (with browser dev console) by ZipFile](https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362)
  - [Retrieving Auth Token (with Selenium) by upbit](https://gist.github.com/upbit/6edda27cb1644e94183291109b8a5fde)

## Installation

Works in Docker Compose environment.

### Docker Compose

If you want to use Docker Compose, write the following in `compose.yaml`:

```yaml
services:
  app:
    image: ghcr.io/tomacheese/pixiv-public-to-private
    volumes:
      - type: bind
        source: ./data
        target: /data/
    init: true
    restart: always
```

You can then refer to the [configuration section](#configuration) to create a configuration file and then launch it with `docker compose up -d`.

## Configuration

Please save the obtained refresh token in `data/token.json`.

```json
{
  "refresh_token": "....."
}
```

### Environment variables

The following environment variables are available:

- `PIXIV_TOKEN_PATH`: pixiv token file path (default value: data/token.json)
- `DELETE_BOOKMARK_FOR_DELETED_ITEMS`: Set to `true` to remove the bookmark when a bookmarked illustration or novel has been deleted (default: not removed; does not apply to followings)
- `ENABLE_ILLUST_BOOKMARKS_CONVERTER`, `ENABLE_NOVEL_BOOKMARKS_CONVERTER`, `ENABLE_FOLLOWING_CONVERTER`: Enable or disable each converter (`true`, `1` or `yes` enable it; any other non-empty value disables it). When unset, illustration and novel bookmarks are enabled and followings are disabled

## License

The license for this project is [MIT License](LICENSE).
