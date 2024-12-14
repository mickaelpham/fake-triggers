# Database Triggers

## Configuration

I need to update the collection to provide the pre and post images. See [this document](https://www.mongodb.com/docs/manual/reference/command/collMod/#change-streams-with-document-pre--and-post-images) for more information.

```js
db.runCommand({ collMod: 'workspace_members', changeStreamPreAndPostImages: { enabled: true } })
```
