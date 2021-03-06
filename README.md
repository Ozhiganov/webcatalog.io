<!--
Inspired by https://github.com/reddit/reddit/blob/f943ac95dea022c65e1b131b1936b2453da8cd3e/README.md
-->

# WebCatalog Server
[![Travis Build Status](https://travis-ci.org/webcatalog/webcatalog-server.svg?branch=master)](https://travis-ci.org/webcatalog/webcatalog-server)

This is the primary codebase that powers [webcatalog.io](https://webcatalog.io).

For notices about major changes and general discussion of WebCatalog development, go to [webcatalog/webcatalog](https://github.com/webcatalog/webcatalog) repo.

### Requirements
- Node.js 8+
- Yarn
- Postgres
- Amazon SES
- Amazon S3
- Amazon CloudFront
- Google OAuth
- Algolia
- Cloudflare

Then, set the environment variables:
```
ALGOLIASEARCH_API_KEY=
ALGOLIASEARCH_API_KEY_SEARCH=
ALGOLIASEARCH_APPLICATION_ID=
ALGOLIASEARCH_INDEX_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
CLOUDFLARE_API_KEY=
CLOUDFLARE_EMAIL=
CLOUDFLARE_ZONE_ID=
CLOUDFRONT_DISTRIBUTION_ID=
DATABASE_URL=
GOOGLE_CALLBACK_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_AUDIENCE=
JWT_ISSUER=
JWT_SECRET=
NODE_MODULES_CACHE=false
S3_ACCESS_KEY=
S3_BUCKET=
S3_SECRET_KEY=
SESSION_SECRET=
VERSION='latest public WebCatalog version'
```

### Quickstart
To set up your own instance of `webcatalog-server` to develop with:
```bash
git clone https://github.com/webcatalog/webcatalog-server.git
cd webcatalog-server
yarn
yarn dev
```

To run the app in production:
```bash
yarn build
yarn start
```

### APIs
To learn more about Webcatalog's API, check out [the API wiki page](https://github.com/webcatalog/webcatalog-server/wiki).

Happy hacking!
