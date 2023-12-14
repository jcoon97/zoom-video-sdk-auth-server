# Zoom Video SDK JWT Server

Use of this sample app is subject to our [Terms of Use](https://explore.zoom.us/en/video-sdk-terms/).

This sample application, built using Express.js with Node.js, demonstrates how to generate a Zoom Video SDK JWT token, including `string`-to-`number` value coercion and full request schema validation.

## Table of Contents

- [Zoom Video SDK JWT Server](#zoom-video-sdk-jwt-server)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Building](#building)
  - [Usage](#usage)
  - [Example Request](#example-request)
  - [Need Help?](#need-help)

## Getting Started

1. Clone this repository and `cd` into the project:

    `cd zoom-video-sdk-auth-server`

2. Install all dependencies using your preferred package manager - npm, yarn, or pnpm:

    `npm install`, `yarn install`, or `pnpm install`

3. Rename `.env.example` to `.env`, edit the file contents to include your [Zoom Video SDK key and secret](https://developers.zoom.us/docs/video-sdk/developer-accounts/#get-video-sdk-credentials), save the file contents, and close the file.

4. Run the development server:

    `npm run start`, `yarn start`, or `pnpm start`

## Building

As this project is written in TypeScript, when you're deploying you may need bundle the code from `.ts` to `.js` before execution. In order to do this, execute `npm run bundle`, `yarn build`, or `pnpm build` to build and bundle all source files. Once complete, all `.js` files will be present within the `dist/` directory.

## Usage

This server only implements one `POST` route: `http://{server}:{port}/`, and observes the following JSON schema.

| Property                 | Type                   | Required? | Validation Rule(s)                                                                                            |
| ------------------------ | ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| `roleType`               | `number` or `string`   | **Yes**   | - Required <br> - Must be of type `number` or coercible to type `number`† <br> - Must equal `0` or `1`        |
| `topic`                  | `string`               | **Yes**   | - Required <br> - Value length be fewer than 200 characters                                                   |
| `expirationMinutes`      | `number` or `string`   | **Yes**   | - Required <br /> - Must be between `30` and `2880` minutes                                                   |
| `userIdentity`           | `string`               | No        | - Must be fewer than 35 characters                                                                            |
| `sessionKey`             | `string`               | No        | - Must be fewer than 36 characters                                                                            |
| `geoRegions`             | `string` or `string[]` | No        | - Must be a comma-separated string with valid Zoom geo regions, or a string array with valid Zoom geo regions |
| `cloudRecordingOption`   | `number` or `string`   | No        | - Must be of type `number` or coercible to type `number`† <br> - Must equal `0` or `1`                        |
| `cloudRecordingElection` | `number` or `string`   | No        | - Must be of type `number` or coercible to type `number`† <br> - Must equal `0` or `1`                        |
| `telemetryTrackingId`    | `string`               | No        | N/A                                                                                                           |

† When providing a value that is identified a "coercible," the JSON value must be of type `number`, or if `string` is provided, it must be coercible/parsable into type `number` via [`parseInt()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt). An error is thrown if value provided is not parsable to type `number`.

## Example Request

```curl
HTTP/1.1 POST http://localhost:4000/

{
  "roleType": 0,
  "topic": "My Session Topic",
  "expirationMinutes": 30
}

...

{
  "_payload": {
    "app_key": "ZOOM_SDK_KEY",
    "role_type": 0,
    "tpc": "My Session Topic",
    "version": 1
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBfa2V5IjoiWk9PTV9TREtfS0VZIiwicm9sZV90eXBlIjowLCJ0cGMiOiJNeSBTZXNzaW9uIFRvcGljIiwidmVyc2lvbiI6MSwiaWF0IjoxNzAyNTI1OTU2LCJleHAiOjE3MDI1Mjc3NTZ9.MAdq_eztvnQDQCbq35e9x7tzvQagDDG3X1doMD7bkRc"
}
```

## Need Help?

If you're looking for help, try [Developer Support](https://devsupport.zoom.us/) or our [Developer Forum](https://devforum.zoom.us/). Priority support is also available with [Premier Developer Support](https://explore.zoom.us/docs/en-us/developer-support-plans.html) plans.