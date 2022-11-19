const test = require('ava');
const transformSync = require('../index.js').transformSync;

test('Mixins should be transformed with correct arguments', t => {

    const input = `
.test {
    .mixin(@arg1, @arg2);
}`;

    const expected = `
.test {
    @include mixin($arg1, $arg2);
}`;

    t.is(transformSync(input), expected);
});

test('Mixins declarations should be transformed', t => {

    const input = `
.mixin(@arg1, @arg2) {
    color: @arg1;
    background: @arg2;
}`;

    // TODO: Somehow the space between the closing parenthesis and the opening curly brace is missing
    const expected = `
@mixin mixin($arg1, $arg2){
    color: $arg1;
    background: $arg2;
}`;

    t.is(transformSync(input), expected);
});
