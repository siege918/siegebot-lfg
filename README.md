[![Build Status](https://travis-ci.com/siege918/siegebot-lfg.svg?branch=master)](https://travis-ci.com/siege918/siegebot-lfg)

# siegebot-lfg

A bot plugin to organize gaming groups and handle scheduling and notification.

## Development

This repo uses an `.editorconfig` to set the code style as well as Prettier to make sure that the code is formatted. Please make sure that you have the editorconfig and prettier plugins installed for your editor.

This repo also uses `husky` and `lint-staged` to run prettier on all commits using a githook.

### Setup

Once you clone down the repository, run an `npm install` to install the dependencies.

**Note** - `discord.js` will print out several `unmet peer dependency` warnings, you can ignore them because they are all optional.

### Running

To test locally, follow the steps below.

- pull down [ACSatron](https://github.com/siege918/ACSatron)
- pull down this repo
- point ACSatron at your local `siegebot-lfg` via package.json
- generate your own Discord API key and assign the bot secret to an environment variable called `ACSBOTTOKEN`

You'll have to invite the bot you make to a server that you run to test.

## References

- [`ACSatron`](https://github.com/siege918/ACSatron)
- [`siegebot-client`](https://github.com/siege918/siegebot-client)
