# eBay Translation Widget

Lightweight, responsive, and fully-customizable component for React applications to translate eBay item title and description to another language.

**Note**: The translation is powered by [eBay Translation API](https://developer.ebay.com/api-docs/commerce/translation/overview.html).

## Table of contents

  - [Motivation](#motivation)
  - [Features](#features)
  - [Usage](#usage)
    - [Prerequisites](#prerequisites)
    - [Install](#install)
  - [Configure](#configure)
    - [Example](#example)
    - [Running the example](#running-the-example)
  - [API](#api)
  - [Note for Production deployment](#note-for-production-deployment)
  - [Logging](#logging)
  - [License](#license)

## Motivation

eBay Translation Widget is a fully customizable React component that allows you to translate eBay item title and description to another language.

This component provides a responsive UI experience with two different modes:

- **Translation by Text**: Simply enter the item title/description in the textbox, set the traslation context and click Translate

<h1 align="center">
  <img src="https://user-images.githubusercontent.com/35708101/132155875-d90b1f79-9e7d-4222-a7dc-102c3b781391.png" alt="Translation by Text - Title"/>
</h1>

<h1 align="center">
  <img src="https://user-images.githubusercontent.com/35708101/132155876-4487bdc4-99da-4604-b814-ddbddd30ee62.png" alt="Translation by Text - Description"/>
</h1>

- **Translation by listing/item ID**: This mode uses [eBay Browse API](https://developer.ebay.com/api-docs/buy/browse/overview.html) to fetch the item title and description and then uses [eBay Translation API](https://developer.ebay.com/api-docs/commerce/translation/overview.html) to do the translation

<h1 align="center">
  <img src="https://user-images.githubusercontent.com/35708101/132155877-c225e1ea-522a-4419-b753-603c1b99d0c6.png" alt="Translation by eBay item number"/>
</h1>

It comes with a ready to use [example](./examples/index.js) and a [NodeJS express server](./examples/server/server.js) to bootstrap integration with [eBay Translation API](https://developer.ebay.com/api-docs/commerce/translation/overview.html).

## Features

- Supports two different modes:
  - Translate by text
  - Translate by eBay listing/item ID
- The widget currently supports nine languages and the to/from permutations can be easily updated in [SupportedTranslations.js](./src/common/SupportedTranslations.js)
- API errors/warnings are displayed as alerts and can be overridden


## Usage

### Prerequisites

```sh
- NodeJS (for the example): v12.16 or higher
- NPM: v7.5.6 or higher/Yarn: v1.22.10 or higher
```

### Install

<a href="https://npmjs.org/package/ebay-translation-react-widget"><img src="https://img.shields.io/npm/v/ebay-translation-react-widget.svg" alt="NPM Version"/></a>  

Using npm:

```sh
npm install ebay-translation-react-widget
```

Using yarn:

```sh
yarn add ebay-translation-react-widget
```

## Configure

Before when running the example, make the following updates to the [options.js](./examples/server/options.js) file:

- **CLIENT_ID**: Your application's Client ID. [More information](https://developer.ebay.com/api-docs/static/oauth-credentials.html)
- **CLIENT_SECRET**: Your application's Client secret. [More information](https://developer.ebay.com/api-docs/static/oauth-credentials.html)
- **ENVIRONMENT**: PRODUCTION/SANDBOX

## API

| Prop                | Description                                                                                                                                                 | Type    | Default | Required |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- | -------- |
| backendEndpoint | Backend server URL                                                                                                                                | String  | ""      | Y        |
| errorMessage | Overrides the error message                                                                                                                                | String  | ""      | N        |
| hideErrors | When passed this will hide the error message alerts                                                                                                                                                                                                                                     | Boolean | false   | N        |
| hideWarnings | When passed this will hide the warning message alerts                                                                                                                                | Boolean  | false      | N        |
| warningMessage | Overrides the warning messages                                                                                                                                | String  | ""      | N        |

## Example

```js
import EbayTranslationWidget from 'ebay-translation-react-widget';

<EbayTranslationWidget backendEndpoint="http://localhost:3001/translate"
/>
```

### Running the example

Using npm:

```sh
npm start
```

Using yarn:

```sh
yarn start
```

Configuration Sample: [options.js](./examples/server/options.js).

## Note for Production deployment

```lang-none
For production, please host with HTTPS enabled.
```

## Logging

Uses standard console logging.

## License

Copyright 2021 eBay Inc.
Developer: Lokesh Rishi

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

<https://www.apache.org/licenses/LICENSE-2.0>

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
