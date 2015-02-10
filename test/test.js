'use strict';

var path     = require('path');
var generate = require('markdown-it-testgen');

/*eslint-env mocha*/

describe('markdown-it-diaspora-mention', function () {
  var md;

  beforeEach(function () {
    md = require('markdown-it')({
      html: true,
      langPrefix: '',
      typographer: true,
      linkify: true
    }).use(require('../'), {
      mentions: [
        {
          diaspora_id: 'user@pod.tld',
          guid: 1337
        },
        {
          diaspora_id: 'evil@pod.tld',
          guid: 666
        },
        {
          handle: 'foo@bar.baz',
          url: '/my/awesome/url',
          guid: 42
        }
      ],
      allowHovercards: true,
      currentUserId: 1337
    });
  });

  it('doesn\'t break normal markup', function () {
    generate(path.join(__dirname, 'fixtures/markdown-it'), md);
  });

  it('applies markup to mentions', function () {
    md.set({ html: false });
    generate(path.join(__dirname, 'fixtures/mention/default.txt'), md);
  });
});
