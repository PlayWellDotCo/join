# join.playwell.co

## Dev Setup

### NPM

Make sure you have node installed and run `npm install`.

### Gulp

We use gulp as our task runner. There are 2 main tasks:

1. Use `gulp build` to compile and minify the JS and SASS. You can find the output in the public directory.
2. Simply call `gulp` to launch a dev server that automatically recompiles the source when files are changed. This basically calls `gulp build` every time it detects a file change. No need to call `gulp build` before publishing if the content in the public directory is up to date.

## Deployment

The site is hosted on Amazon S3 using Collin's AWS account.

Create a file in the root of this project called `aws-credentials.json`. It should look like this:

```json
{
  "accessKeyId": "ACCESS_KEY_ID",
  "secretAccessKey": "SECRET_ACCESS_KEY"
}
```

Include your keys in the json file and you will be able to automatically deploy everything from the public directory to the S3 bucket using the gulp command `gulp publish`.
