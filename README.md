# str-mask
Mask text by pattern

[![NPM version](https://img.shields.io/npm/v/str-mask.svg)](https://npmjs.org/package/str-mask)
[![Build status](https://img.shields.io/travis/tamtakoe/str-mask.svg)](https://travis-ci.org/tamtakoe/str-mask)

**Note:** This module works in browsers and Node.js >= 4.0

## Installation

```sh
npm install str-mask
```

## Usage

```js
const mask = require('str-mask');

mask('9211234567', {mask: '+7 (999) 999-99-99'})
// { model: '9211234567',
//   viewValue: '+7 (921) 123-45-67',
//   isValid: true,
//   cursor: 18 }

mask('92112', {mask: '+7 (999) 999-99-99'})
// { model: '92112',
//   viewValue: '+7 (921) 12',
//   isValid: false,
//   cursor: 11 }

mask('92112', {mask: '+7 (999) 999-99-99', filler: '_'})
// { model: '92112',
//   viewValue: '+7 (921) 12_-__-__',
//   isValid: false,
//   cursor: 11 }
```


## Special mask characters

Character | Description
--- | ---
`9` | Any numbers
`A` | Any alphanumeric character
`*` | Any letter
`U` | Any letter (All lower case character will be mapped to uppercase)
`L` | Any letter (All upper case character will be mapped to lowercase)
`?` |  Make any part of the mask optional
`\\` | Escape character, used to escape any of the special formatting characters.


## API

### mask(value, [params])

- **value** (`String`) - Masked value (any values convert to string)

- **params** (`Object`)
  * mask (`String`) - mask
  * filler (`String`) - string for empty spaces. You can use one symbol pattern `_` or string likes mask `DD/MM/DDDD`
  * escChar (`String`) - char for escaping. Default: `\\`
  * chars (`Object` ) - map of special chars. You can add extra chars or remove default if set `<char>: null`. Default:
```js
'9': /\d/,
'A': /[a-zA-Z]/,
'*': /[a-zA-Z0-9]/,
'U': function(letter) {
    letter = letter.toUpperCase();

    if (/[a-zA-Z0-9]/.test(letter)) {
        return letter;
    }
},
'L': function(letter) {
    letter = letter.toLowerCase();

    if (/[a-zA-Z0-9]/.test(letter)) {
        return letter;
    }
}
```

--

### mask.curry([params])

- **params** - see mask params.

- **return** (`Function`) - function, which gets value and returns result of masking

```js
phoneMask = mask.curry({mask: '+7 (999) 999-99-99', filler: '_'})

phoneMask(+792112)
// { model: '92112',
//   viewValue: '+7 (921) 12_-__-__',
//   isValid: false,
//   cursor: 11 }

phoneMask(92112345)
// { model: '92112',
//   viewValue: '+7 (921) 123-45-__',
//   isValid: false,
//   cursor: 16 }
```


## Tests

```sh
npm install
npm test
```

## License

[MIT](LICENSE)
