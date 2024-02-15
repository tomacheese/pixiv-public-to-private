# pixiv-public-to-private

Changes all illustrations and novels publicly bookmarked on pixiv to private bookmarks.

## Requirements

- Native Node.js or Docker
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

## License

The license for this project is [MIT License](LICENSE).
