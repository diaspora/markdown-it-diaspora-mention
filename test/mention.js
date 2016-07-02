"use strict";

const path = require("path"),
      generate = require("markdown-it-testgen"),
      MarkdownIt = require("markdown-it"),
      mentionPlugin = require("../");

describe("markdown-it-diaspora-mention", function() {
  let md;

  beforeEach(function() {
    md = new MarkdownIt({
      html: true,
      langPrefix: "",
      typographer: true,
      linkify: true
    }).use(mentionPlugin, {
      mentions: [
        {
          "diaspora_id": "user@pod.tld",
          "guid": 1337
        },
        {
          "diaspora_id": "evil@pod.tld",
          "guid": 666
        },
        {
          "handle": "foo@bar.baz",
          "url": "/my/awesome/url",
          "guid": 42
        }
      ],
      allowHovercards: true,
      currentUserId: 1337
    });
  });

  it("applies markup to mentions", function() {
    md.set({html: false});
    generate(path.join(__dirname, "fixtures/mention/default.txt"), md);
  });
});
