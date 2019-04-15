# snips-action-unit-converter
# Unit converter
#### Snips action code for the Unit Conversion app.

## Setup

```sh
# Install the dependencies, builds the action and creates the config.ini file.
sh setup.sh
```

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

## Demo cases
#### This app only provide the conversion between two specified units.

Convert a specific amount to the destination unit
> *Hey Snips, convert 6 kilometers in miles, please*

Give the conversion between a unit and another
> *Hey Snips, one gallon is how many liters?*