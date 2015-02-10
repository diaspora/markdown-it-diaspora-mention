# markdown-it-diaspora-mention

[![Build Status](https://img.shields.io/travis/diaspora/markdown-it-diaspora-mention/master.svg?style=flat)](https://travis-ci.org/diaspora/markdown-it-diaspora-mention)
[![Coverage Status](https://img.shields.io/coveralls/diaspora/markdown-it-diaspora-mention/master.svg?style=flat)](https://coveralls.io/r/diaspora/markdown-it-diaspora-mention?branch=master)
[![npm version](https://img.shields.io/npm/v/markdown-it-diaspora-mention.svg?style=flat)](https://npmjs.com/package/markdown-it-diaspora-mention)

> diaspora-style @mention plugin for [markdown-it](https://github.com/markdown-it/markdown-it) markdown parser.

`@{User Name; user@pod.tld}` => `<a href="/people/1337" class="mention">User Name</a>`

## Install

node.js, bower:

```bash
npm install markdown-it-diaspora-mention --save
bower install markdown-it-diaspora-mention --save
```

## Use

```js
var md = require('markdown-it')()
            .use(require('markdown-it-diaspora-mention'), {
              mentions: [
                {
                  diaspora_id: 'user@pod.tld',
                  guid: 1337
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

md.render('@{User Name; user@pod.tld}'); // => '<a href="/people/1337" class="mention">User Name</a>'
md.render('@{Foo Bar; foo@bar.baz}'); // => '<a href="/my/awesome/url" class="mention hovercardable">Foo Bar</a>'
```

_Differences in browser._ If you load the script directly into the page, without
package system, module will add itself globally as `window.markdownitDiasporaMention`.

## License

[MIT](https://github.com/svbergerem/markdown-it-hashtag/blob/master/LICENSE)
