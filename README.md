# snips-action-unit-converter
#### Snips action code for the Unit Conversion app.

## Setup

```sh
# Install the dependencies, builds the action and creates the config.ini file.
sh setup.sh
```

## Language configuration

In the `config.ini` file (english and french available for now):

```sh
# Change the locale variable into the language that you want.
[global]
locale=english
```
*On the [Snips Console](https://console.snips.ai/home/assistants/) you should add the corresponding version of the app (EN or FR).*

## Run

- Dev mode:

```sh
# Dev mode watches for file changes and restarts the action.
npm run dev
```

- Prod mode:

```sh
# 1) Lint, transpile and test.
npm start
# 2) Run the action.
node action-unit-converter.js
```

## Debug

In the `action-unit-converter.js` file:

```js
// Uncomment this line to print everything
// debug.enable(name + ':*')
```

## Test

*Requires [mosquitto](https://mosquitto.org/download/) to be installed.*

```sh
npm run test
```

**In test mode, i18n output and http calls are mocked.**

- **http**: see `tests/httpMocks/index.ts`
- **i18n**: see `src/factories/i18nFactory.ts`

## Assistant deployment

To try the app on an assistant, you should deploy your assistant first : 

    * Create a new assistant on the [Snips Console](https://console.snips.ai/home/assistants/) or use an existant one
    * Add the `Unit Conversion` (EN or FR) to this assistant
    * Click on `Deploy assistant` you can ether install it using [Sam](https://docs.snips.ai/reference/sam) or [deploy it manually](https://docs.snips.ai/articles/console/actions/deploying-your-skills#deploy-manually-without-sam)

Other infos can be found on the official [Snips Documentation](https://docs.snips.ai/)

## Demo cases
#### This app only provide the conversion between two specified units.

Convert a specific amount to the destination unit
> *Hey Snips, convert 6 kilometers in miles, please*

Give the conversion between a unit and another
> *Hey Snips, one gallon is how many liters?*