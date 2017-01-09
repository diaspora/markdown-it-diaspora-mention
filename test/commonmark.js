const p = require("path"),
      load = require("markdown-it-testgen").load,
      assert = require("chai").assert,
      MarkdownIt = require("markdown-it"),
      MentionPlugin = require("../");

function normalize(text) {
  return text.replace(/<blockquote>\n<\/blockquote>/g, "<blockquote></blockquote>");
}

function generate(path, md) {
  load(path, (data) => {
    let desc;
    data.meta = data.meta || {};
    desc = data.meta.desc || p.relative(path, data.file);
    (data.meta.skip ? describe.skip : describe)(desc, function() {
      data.fixtures.forEach((fixture) => {
        it(fixture.header ? fixture.header : "line " + (fixture.first.range[0] - 1), function() {
          assert.strictEqual(md.render(fixture.first.text), normalize(fixture.second.text));
        });
      });
    });
  });
}

describe("CommonMark", function() {
  const md = new MarkdownIt("commonmark");

  md.use(MentionPlugin, {
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

  generate(p.join(__dirname, "fixtures/vendor/commonmark/good.txt"), md);
});
