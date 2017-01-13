# markdown-it-diaspora-mention

[![Build Status](https://img.shields.io/travis/diaspora/markdown-it-diaspora-mention/master.svg?style=flat)](https://travis-ci.org/diaspora/markdown-it-diaspora-mention)
[![Coverage Status](https://coveralls.io/repos/github/diaspora/markdown-it-diaspora-mention/badge.svg?branch=master)](https://coveralls.io/github/diaspora/markdown-it-diaspora-mention?branch=master)
[![npm version](https://img.shields.io/npm/v/markdown-it-diaspora-mention.svg?style=flat)](https://npmjs.com/package/markdown-it-diaspora-mention)

> diaspora-style @mention plugin for [markdown-it](https://github.com/markdown-it/markdown-it) markdown parser.

`@{user@pod.tld}` => `<a href="/people/1337" class="mention">User Name</a>`
`@{User Name; user@pod.tld}` => `<a href="/people/1337" class="mention">User Name</a>`

## Install

node.js, bower:

```bash
npm install markdown-it-diaspora-mention --save
bower install markdown-it-diaspora-mention --save
```

## Use

```js
var md = require("markdown-it")()
            .use(require("markdown-it-diaspora-mention"), {
              mentions: [
                {
                  diaspora_id: "user@pod.tld",
                  guid: 1337,
                  name: "Alice Awesome"
                },
                {
                  handle: "foo@bar.baz",
                  url: "/my/awesome/url",
                  guid: 42,
                  name: "Foo Bar"
                }
              ],
              allowHovercards: true,
              currentUserId: 1337
            });

md.render("@{User Name; user@pod.tld}"); // => "<a href='/people/1337' class='mention'>User Name</a>"
md.render("@{user@pod.tld}"); // => "<a href='/people/1337' class='mention'>Alice Awesome</a>"
md.render("@{Foo Bar; foo@bar.baz}"); // => "<a href='/my/awesome/url' class='mention hovercardable'>Foo Bar</a>"
```

_Differences in the browser._ If you load the script directly into the page, without a
package system, the module will add itself globally as `window.markdownitDiasporaMention`.

## License

[MIT](https://github.com/svbergerem/markdown-it-hashtag/blob/master/LICENSE)
