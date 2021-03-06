(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.strMask = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var defaultChars = {
    '9': /\d/,
    'A': /[a-zA-Z]/,
    'U': function U(letter) {
        letter = letter.toUpperCase();

        if (/[a-zA-Z0-9]/.test(letter)) {
            return letter;
        }
    },
    'L': function L(letter) {
        letter = letter.toLowerCase();

        if (/[a-zA-Z0-9]/.test(letter)) {
            return letter;
        }
    },
    '*': /[a-zA-Z0-9]/
};

function prepareOptions(options) {
    options = options || {};

    var mask = options.mask,
        escChar = options.escChar || '\\',
        chars = Object.assign({}, defaultChars, options.chars),
        maskChars,
        maskChar,
        maskCharFn,
        isOptional,
        i;

    //Set maskChars array
    if (typeof mask === 'string') {
        //use value if mask is not string
        maskChars = [];

        for (i = 0; i < mask.length; i++) {
            maskChar = mask[i];
            maskCharFn = chars[maskChar];
            isOptional = false;

            if (maskChar === escChar) {
                maskChar = mask[++i];
            } else if (maskChar === '?') {
                maskChar = mask[++i];
                maskCharFn = chars[maskChar];
                isOptional = true;
            }

            if (maskCharFn instanceof RegExp) {
                maskCharFn = function (regExp) {
                    return function (letter) {
                        if (regExp.test(letter)) {
                            return letter;
                        }
                    };
                }(maskCharFn);
            }

            if (typeof maskCharFn === 'function') {
                maskChar = maskCharFn;
            }

            maskChars.push(isOptional ? [maskChar] : maskChar);
        }
    }

    return { m: maskChars, f: options.filler || '' };
}

function setMask(value, maskChars, filler) {
    value = String(value || '');

    var model = '',
        viewValue = '',
        valueChar,
        maskChar,
        cursor,
        isInvalid,
        isOptionalMask,
        i,
        j;

    if (!maskChars) {
        model = viewValue = value;
        maskChars = [];
    }

    //Set model
    for (i = 0, j = 0; i < maskChars.length; i++, j++) {
        valueChar = value[j];
        maskChar = maskChars[i];
        isOptionalMask = false;

        //If optional mask char
        if (maskChar instanceof Array) {
            isOptionalMask = true;
            maskChar = maskChar[0];
        }

        //If last value char
        if (!valueChar) {
            isInvalid = true;
            break;
        }

        if (typeof maskChar === 'function') {
            valueChar = maskChar(valueChar);

            if (valueChar) {
                model += valueChar;
            } else {
                isOptionalMask ? j-- : i--;
            }
        } else {
            if (maskChar !== valueChar) {
                j--;
            }
        }
    }

    //Set viewValue
    var modelArr = model.split('');

    for (i = 0; i < maskChars.length; i++) {
        maskChar = maskChars[i];
        isOptionalMask = false;

        //If optional mask char
        if (maskChar instanceof Array) {
            maskChar = maskChar[0];
            isOptionalMask = true;
        }

        if (typeof maskChar === 'function') {
            if (modelArr.length) {
                if (isOptionalMask && !maskChar(modelArr[0])) {
                    viewValue += filler[0];
                } else {
                    viewValue += modelArr.shift();
                }
            } else {
                if (cursor === undefined) {
                    cursor = viewValue.length;
                }

                if (!filler) {
                    break;
                }

                viewValue += filler[0]; //Fill empty places by filler
            }
        } else {
            viewValue += maskChar;
        }

        if (filler.length > 1) {
            filler = filler.substr(1);
        }
    }

    return {
        model: model,
        viewValue: viewValue,
        isValid: !isInvalid,
        cursor: cursor === undefined ? viewValue.length : cursor
    };
}

function mask(value, options) {
    options = prepareOptions(options);

    return setMask(value, options.m, options.f);
}

mask.curry = function (options) {
    //Partial application
    options = prepareOptions(options);

    return function (value) {
        return setMask(value, options.m, options.f);
    };
};

module.exports = mask;
},{}]},{},[1])(1)
});