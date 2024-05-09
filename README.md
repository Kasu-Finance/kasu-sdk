# Kasu Frontend

## FE Architecture

- nextjs
- node
- typescript
- husky
- eslint
- commitlint
- prettier

## Usage

Clone the repo:

- `npm install`
- `npm run dev`
- `npm run build`

## Scripts

- `npm run dev:https` - run dev server
- `npm run build` - build for production
- `npm run start` - serve production build
- `npm run lint` - run eslint
- `npm run lint:fix` - run eslint with fix
- `npm run format` - run prettier and format all files
- `npm run format:check` - check which files are not formatted
- `npm run generate-types` - create types from abis
- `npm run types` - check types

## Solidant Packages

To install Solidant packages like:
`https://github.com/solidant/kasu-sdk/pkgs/npm/kasu-sdk`

1. create a github token with read:packages permission:
   settings -> developer settings -> personal access token
2. create a file named .npmrc (dont commit this file, add it to gitignore) and add in:
   @solidant:registry=https://npm.pkg.github.com/
   //npm.pkg.github.com/:\_authToken=YOUR_TOKEN_HERE

## Committing

- `npm run commit` - run commitizen to create a commit message
- `npm run commit:lint` - run commitlint to check commit message

Allowed commit types (commitlint.config.js): `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`
For commits check [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) and [commitlint](https://commitlint.js.org/#/) for more info.
