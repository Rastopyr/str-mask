'use strict';

const expect = require('chai').expect;
const mask = require('../src/str-mask');

describe('test', function() {
    describe("initialization", function () {

        it("should not not happen if the mask is undefined or invalid", function() {
            expect(mask('abc123')).deep.equal({model: 'abc123', viewValue: 'abc123', isValid: true, cursor: 6});
            expect(mask('abc123', {mask: '()_abc123'})).deep.equal({model: '', viewValue: '()_abc123', isValid: true, cursor: 9});
        });

        it("should mask the value only if it's valid", function() {
            expect(mask('abc123', {mask: '(A) * 9'})).deep.equal({model: 'ab1', viewValue: '(a) b 1', isValid: true, cursor: 7});
            expect(mask('abc123', {mask: '(A) * 9 A'})).deep.equal({model: 'ab1', viewValue: '(a) b 1 ', isValid: false, cursor: 8});
        });

        it("test", function() {
            expect(mask('Ab1', {mask: '\\AA9', filler: '_'})).deep.equal({model: 'b1', viewValue: 'Ab1', isValid: true, cursor: 3});
        });



        it("should merge the mask definition set globally with the definition set per element", function() {
            var maskDefinitions = {
                "A": /[A-Z]/,  //make A caps only
                "b": /[a-z]/   //make b lowercase only
            };

            expect(mask('f123cCCc', {mask: '@193Ab', filler: '_', chars: maskDefinitions})).deep.equal({model: '1Cc', viewValue: '@113Cc', isValid: true, cursor: 6});
        });
    });

    describe("user input", function () {
        it("should mask-as-you-type", function() {
            expect(mask('', {mask: '(A) * 9', filler: '_'})).deep.equal({model: '', viewValue: '(_) _ _', isValid: false, cursor: 1});
            expect(mask('a', {mask: '(A) * 9', filler: '_'})).deep.equal({model: 'a', viewValue: '(a) _ _', isValid: false, cursor: 4});
            expect(mask('ab', {mask: '(A) * 9', filler: '_'})).deep.equal({model: 'ab', viewValue: '(a) b _', isValid: false, cursor: 6});
            expect(mask('ab1', {mask: '(A) * 9', filler: '_'})).deep.equal({model: 'ab1', viewValue: '(a) b 1', isValid: true, cursor: 7});
        });

        it("should not set model to an empty mask", function() {
            expect(mask('abc123', {mask: ''})).deep.equal({model: '', viewValue: '', isValid: true, cursor: 0});
        });

        it("should not bleed static mask characters into the value when backspacing", function() {
            expect(mask('', {mask: 'QT****', filler: '_'})).deep.equal({model: '', viewValue: 'QT____', isValid: false, cursor: 2});
        });


        it("should set model value properly when the value contains the same character as a static mask character", function() {
            expect(mask('', {mask: '19', filler: '_'})).deep.equal({model: '', viewValue: '1_', isValid: false, cursor: 1});
            expect(mask('11', {mask: '19', filler: '_'})).deep.equal({model: '1', viewValue: '11', isValid: true, cursor: 2});
            expect(mask('', {mask: '9991999', filler: '_'})).deep.equal({model: '', viewValue: '___1___', isValid: false, cursor: 0});
            expect(mask('1231456', {mask: '9991999', filler: '_'})).deep.equal({model: '123456', viewValue: '1231456', isValid: true, cursor: 7});
        });

        it("should mask the input properly with multiple identical mask components", function() {
            expect(mask('811', {mask: '99.99.99-999.99', filler: '_'})).deep.equal({model: '811', viewValue: '81.1_.__-___.__', isValid: false, cursor: 4});
        });
    });

    describe("default mask definitions", function () {
        it("should accept optional mask after '?'", function (){
            expect(mask('aa---', {mask: '**?9', filler: '_'})).deep.equal({model: 'aa', viewValue: 'aa_', isValid: true, cursor: 2});
            expect(mask('99a___', {mask: '**?9', filler: '_'})).deep.equal({model: '99', viewValue: '99_', isValid: true, cursor: 2});
            expect(mask('992___', {mask: '**?9', filler: '_'})).deep.equal({model: '992', viewValue: '992', isValid: true, cursor: 3});

        });

        it("should limit optional mask to a single character", function() {
            expect(mask('1', {mask: '9?99', filler: '_'})).deep.equal({model: '1', viewValue: '1__', isValid: false, cursor: 1});
        });
    });

    describe("escChar", function () {
        it("should escape default mask definitions", function() {
            expect(mask('a', {mask: '\\A\\9\\*\\?*', filler: '_'})).deep.equal({model: 'a', viewValue: 'A9*?a', isValid: true, cursor: 5});
        });
        it("should not confuse entered values with escaped values", function() {
            expect(mask('A9A9', {mask: '\\A\\9\\*\\?****', filler: '_'})).deep.equal({model: 'A9', viewValue: 'A9*?A9__', isValid: false, cursor: 6});
        });
        it("should escape custom mask definitions", function() {
            expect(mask('', {mask: '\\QQ', filler: '_', chars: {'Q': /[Qq]/}})).deep.equal({model: '', viewValue: 'Q_', isValid: false, cursor: 1});
            expect(mask('q', {mask: '\\QQ', filler: '_', chars: {'Q': /[Qq]/}})).deep.equal({model: 'q', viewValue: 'Qq', isValid: true, cursor: 2});
        });
        it("should escape normal characters", function() {
            expect(mask('', {mask: '\\W*', filler: '_'})).deep.equal({model: '', viewValue: 'W_', isValid: false, cursor: 1});
            expect(mask('q', {mask: '\\W*', filler: '_'})).deep.equal({model: 'q', viewValue: 'Wq', isValid: true, cursor: 2});
        });
        it("should escape itself", function() {
            expect(mask('', {mask: '\\\\*', filler: '_'})).deep.equal({model: '', viewValue: '\\_', isValid: false, cursor: 1});
            expect(mask('a', {mask: '\\\\*', filler: '_'})).deep.equal({model: 'a', viewValue: '\\a', isValid: true, cursor: 2});
        });
        it("should change the escape character", function() {
            expect(mask('', {mask: '\\!A!9!*!Q!!!W*', filler: '_', chars: {'Q': /[Qq]/}, escChar: '!'})).deep.equal({model: '', viewValue: '\\A9*Q!W_', isValid: false, cursor: 7});
            expect(mask('a', {mask: '\\!A!9!*!Q!!!W*', filler: '_', chars: {'Q': /[Qq]/}, escChar: '!'})).deep.equal({model: 'a', viewValue: '\\A9*Q!Wa', isValid: true, cursor: 8});
        });
        it("should use 'no' to mean no escape character", function() {
            expect(mask('', {mask: '!\\A!9!*!!*', filler: '_', escChar: 'no'})).deep.equal({model: '', viewValue: '!\\_!_!_!!_', isValid: false, cursor: 2});
            expect(mask('a', {mask: '!\\A!9!*!!*', filler: '_', escChar: 'no'})).deep.equal({model: 'a', viewValue: '!\\a!_!_!!_', isValid: false, cursor: 4});
        });
    });

    describe("placeholders", function () {
        it("should have default placeholder functionality", function() {
            expect(mask('', {mask: '99/99/9999', filler: '_'})).deep.equal({model: '', viewValue: '__/__/____', isValid: false, cursor: 0});
        });

        it("should allow mask substitutions via the placeholder attribute", function() {
            expect(mask('', {mask: '99/99/9999', filler: 'MM/DD/YYYY'})).deep.equal({model: '', viewValue: 'MM/DD/YYYY', isValid: false, cursor: 0});
            expect(mask('12', {mask: '99/99/9999', filler: 'MM/DD/YYYY'})).deep.equal({model: '12', viewValue: '12/DD/YYYY', isValid: false, cursor: 3});
        });

        it("should ignore the '?' character", function() {
            expect(mask('', {mask: '99/99/9999 ?99:99', filler: 'DD/MM/YYYY HH:mm'})).deep.equal({model: '', viewValue: 'DD/MM/YYYY HH:mm', isValid: false, cursor: 0});
        });

        it("should accept ui-mask-placeholder", function() {
            expect(mask('', {mask: '(999) 999-9999', filler: '(XXX) XXX-XXXX'})).deep.equal({model: '', viewValue: '(XXX) XXX-XXXX', isValid: false, cursor: 1});
        });

        it("should accept ui-mask-placeholder-char with value `space`", function() {
            expect(mask('', {mask: '(999) 999-9999', filler: ' '})).deep.equal({model: '', viewValue: '(   )    -    ', isValid: false, cursor: 1});
        });

        it("should allow text input to be the same character as ui-mask-placeholder-char", function() {
            expect(mask('6505265486', {mask: '(999) 999-9999', filler: '5'})).deep.equal({model: '6505265486', viewValue: '(650) 526-5486', isValid: true, cursor: 14});
        });

        it("should allow text input to be the same character as characters in ui-mask-placeholder", function() {
            expect(mask('6505265486', {mask: '(999) 999-9999', filler: '(555) 555-5555'})).deep.equal({model: '6505265486', viewValue: '(650) 526-5486', isValid: true, cursor: 14});
        });
    });

});