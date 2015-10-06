'use strict';

var path = require('path');
var generate = require('markdown-it-testgen');

describe('markdown-it', function () {
  var md = require('markdown-it')({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true
  });

  md.use(require('../'), {
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

  generate(path.join(__dirname, 'fixtures/vendor/markdown-it'), md);
});
