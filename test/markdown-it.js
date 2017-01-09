const path = require("path"),
      generate = require("markdown-it-testgen"),
      MarkdownIt = require("markdown-it"),
      mentionPlugin = require("../");

describe("markdown-it", function() {
  const md = new MarkdownIt({
    html: true,
    langPrefix: "",
    typographer: true,
    linkify: true
  });

  md.use(mentionPlugin, {
    mentions: [
      {
        "diaspora_id": "user@pod.tld",
        "guid": 1337,
        "name": "User Name"
      },
      {
        "diaspora_id": "userwithspaces@pod.tld",
        "guid": 1338,
        "name": "User Name "
      },
      {
        "diaspora_id": "evil@pod.tld",
        "guid": 666,
        "name": "<script>alert(0)</script>"
      },
      {
        "handle": "foo@bar.baz",
        "url": "/my/awesome/url",
        "guid": 42,
        "name": "User Foo"
      }
    ],
    allowHovercards: true,
    currentUserId: 1337
  });

  generate(path.join(__dirname, "fixtures/vendor/markdown-it"), md);
});
