const test = require('ava');
const transformSync = require('../index.js').transformSync;

test('Imports should be transformed and extension changed', t => {
    t.is(transformSync('@import "test.less";'), '@import "test.scss";');
});
