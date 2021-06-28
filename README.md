# tz-wrapped-frontend

The frontend component of the tz-wrapped application.

The backend can be found [here](https://github.com/airgap-it/tz-wrapped-backend).

## Build

1. npm install
2. npm run build:local

To build for different environments just change the build command to `npm run build:dev` for development or `npm run build:prod` for production.

## Development server

Run `npm run start:local`.

To start the development server for different environments just change the start command to `npm run start:dev` for development or `npm run start:prod` for production.

## Running unit tests

Run `npm run test`.

## Configuration

The node URL and the backend URL are configured in the environment files under `src/environments`. Depending on the environment you are running, change the corresponding file and provide a valid node and backend URL.
