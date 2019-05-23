# snips-action-unit-converter

Snips action code for the Unit Conversion app

## Setup

```sh
sh setup.sh
```

Don't forget to edit the `config.ini` file.

An assistant containing the intents listed below must be installed on your system. Deploy it following [these instructions](https://docs.snips.ai/articles/console/actions/deploy-your-assistant).

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

## Test & Demo cases

This app only supports french 🇫🇷 and english 🇬🇧.

### UnitConvert

#### Convert between two specified units

Convert a specific amount to the destination unit
> *Hey Snips, convert 6 kilometers in miles, please*

Give the conversion between a unit and another
> *Hey Snips, one gallon is how many liters?*

## Debug

In the `action-unit-converter.js` file:

```js
// Uncomment this line to print everything
// debug.enable(name + ':*')
```

## Test & Lint

*Requires [mosquitto](https://mosquitto.org/download/) to be installed.*

```sh
npm start
```

**In test mode, i18n output and http calls are mocked.**

- **http**: see `tests/httpMocks/index.ts`
- **i18n**: see `src/factories/i18nFactory.ts`

## Contributing

Please see the [Contribution Guidelines](https://github.com/snipsco/snips-action-unit-converter/blob/master/CONTRIBUTING.md).

## Copyright

This library is provided by [Snips](https://snips.ai) as Open Source software. See [LICENSE](https://github.com/snipsco/snips-action-unit-converter/blob/master/LICENSE) for more information.
