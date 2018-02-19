var chromeResults = require('../tmp/gu.json');
var assert = require('assert');

describe('integrations', function () {
  var listResult;
  before(function () {
    listResult = chromeResults[1].violations.find(result => result.id === 'list');
  });

  it('finds list results', function () {
    assert.equal(chromeResults.length, 2);
    assert.equal(listResult.nodes.length, 2);
  });

  it('has light DOM results', function () {
    assert.deepEqual(listResult.nodes[0].target, ['#list'])
  });

  it('has shadow DOM results', function () {
    assert.deepEqual(listResult.nodes[1].target, [['#shadow-root', '#shadow-list']])
  });
});
