# Database Triggers

Playing with a fake database trigger runner on my local dev environment.

## Setup

This assumes that you have Docker running locally.

```sh
npm install           # install dependencies
docker compose up -d  # start the services
cp .env.sample .env   # configure the application
```

Then edit the `.env` file with a MongoDB URL, e.g.:

```
# MongoDB instance
DATABASE_URL=http://localhost:27019/some_database
```

Finally, prepare the database so it's configured for change streams pre and post images, and has some indexes:

```sh
npm run db:prepare
```

Listen for change stream events:

```sh
npm run listen
```

In another terminal, run some scenarios, or modify the data in MongoDB directly, using [Compass](https://www.mongodb.com/products/tools/compass) or whatever tool you fancy.

```sh
npm run exec <PATH TO SCENARIO>
```

## Testing

For now, this is using the same database as the development environment, and you need to run the listener process before the test suite:

```sh
npm run listen

# in another shell
npm test
```

## Configuration

I need to update the collection to provide the pre and post images. See [this document](https://www.mongodb.com/docs/manual/reference/command/collMod/#change-streams-with-document-pre--and-post-images) for more information.

```js
db.runCommand({ collMod: 'workspace_members', changeStreamPreAndPostImages: { enabled: true } })
```
