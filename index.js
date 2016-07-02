"use strict";

const mentionOpen = (tokens, idx) => `<a href="${tokens[idx].content}" class="${tokens[idx].linkclass}">`,
      mentionClose = () => "</a>",
      mentionText = (tokens, idx) => tokens[idx].content,
      isLinkOpen = str => /^<a[>\s]/i.test(str),
      isLinkClose = str => /^<\/a\s*>/i.test(str);

module.exports = function mentionPlugin(md, options) {
  const arrayReplaceAt = md.utils.arrayReplaceAt,
        escapeHtml = md.utils.escapeHtml,
        assign = md.utils.assign,
        defaultOpts = {
          mentions: [],
          allowHovercards: false
        },
        opts = typeof options === "object" ? assign(defaultOpts, options) : defaultOpts,
        /* eslint-disable camelcase */
        findPersonById = id => opts.mentions.find(m => id === m.diaspora_id || id === m.handle);
        /* eslint-enable camelcase */

  function mention(state) {
    const blockTokens = state.tokens,
          Token = state.Token,
          mentionRegExp = "@\\{([^;]+); ([^\\}]+)\\}",
          regex = new RegExp(mentionRegExp),
          regexGlobal = new RegExp(mentionRegExp, "g");
    let i, j, l, m,
        currentToken,
        tokens,
        token,
        htmlLinkLevel,
        matches,
        match,
        pos,
        name,
        diasporaId,
        person,
        linkclass,
        text,
        nodes,
        level;

    for (j = 0, l = blockTokens.length; j < l; j++) {
      if (blockTokens[j].type !== "inline") {
        continue;
      }

      tokens = blockTokens[j].children;
      htmlLinkLevel = 0;

      for (i = tokens.length - 1; i >= 0; i--) {
        currentToken = tokens[i];

        // skip content of markdown links
        if (currentToken.type === "link_close") {
          i--;
          while (tokens[i].level !== currentToken.level && tokens[i].type !== "link_open") {
            i--;
          }
          continue;
        }

        // skip content of html links
        if (currentToken.type === "html_inline") {
          // we are going backwards, so isLinkOpen shows end of link
          if (isLinkOpen(currentToken.content) && htmlLinkLevel > 0) {
            htmlLinkLevel--;
          }
          if (isLinkClose(currentToken.content)) {
            htmlLinkLevel++;
          }
        }

        if (htmlLinkLevel > 0) {
          continue;
        }

        if (currentToken.type !== "text") {
          continue;
        }

        // find mentions
        text = currentToken.content;
        matches = text.match(regexGlobal);

        if (matches === null) {
          continue;
        }

        nodes = [];
        level = currentToken.level;

        for (m = 0; m < matches.length; m++) {
          match = matches[m].match(regex);
          pos = text.indexOf(matches[m]);
          name = match[1];
          diasporaId = match[2];
          linkclass = "mention";

          if (pos > 0) {
            token = new Token("text", "", 0);
            token.content = text.slice(0, pos);
            token.level = level;
            nodes.push(token);
          }

          person = findPersonById(diasporaId);

          if (person) {
            if (opts.allowHovercards && person.guid !== opts.currentUserId) {
              linkclass += " hovercardable";
            }

            token = new Token("mention_open", "", 1);
            token.content = person.url || "/people/" + person.guid;
            token.linkclass = linkclass;
            token.level = level++;
            nodes.push(token);

            token = new Token("mention_text", "", 0);
            token.content = escapeHtml(name).trim();
            token.level = level;
            nodes.push(token);

            token = new Token("mention_close", "", -1);
            token.level = --level;
            nodes.push(token);
          } else {
            token = new Token("text", "", 0);
            token.content = name;
            token.level = level;
            nodes.push(token);
          }
          text = text.slice(pos + match[0].length);
        }

        if (text.length > 0) {
          token = new Token("text", "", 0);
          token.content = text;
          token.level = state.level;
          nodes.push(token);
        }

        // replace current node
        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
      }
    }
  }

  md.core.ruler.after("inline", "mention", mention);
  /* eslint-disable camelcase */
  md.renderer.rules.mention_open = mentionOpen;
  md.renderer.rules.mention_text = mentionText;
  md.renderer.rules.mention_close = mentionClose;
  /* eslint-enable camelcase */
};
