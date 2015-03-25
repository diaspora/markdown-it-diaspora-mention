// Process @mention

'use strict';

//////////////////////////////////////////////////////////////////////////
// Renderer partials

function mention_open(tokens, idx) {
  return '<a href="' +
         tokens[idx].content +
         '" class="' +
         tokens[idx].linkclass +
         '">';
}

function mention_close() { return '</a>'; }

function mention_text(tokens, idx) {
  return tokens[idx].content;
}

//////////////////////////////////////////////////////////////////////////

function isLinkOpen(str)  { return /^<a[>\s]/i.test(str); }
function isLinkClose(str) { return /^<\/a\s*>/i.test(str); }

module.exports = function mention_plugin(md, options) {

  var arrayReplaceAt = md.utils.arrayReplaceAt;
  var escapeHtml = md.utils.escapeHtml;
  var mentions = [];
  var currentUserId;
  var allowHovercards;

  if (typeof options.mentions !== 'undefined') {
    mentions = options.mentions;
  }

  if (typeof options.currentUserId !== 'undefined') {
    currentUserId = options.currentUserId;
  }

  if (typeof options.allowHovercards !== 'undefined') {
    allowHovercards = options.allowHovercards;
  }

  function findPersonById(id) {
    var i;
    for (i = 0; i < mentions.length; i++) {
      if (id === mentions[i].diaspora_id || id === mentions[i].handle) {
        return mentions[i];
      }
    }
    return null;
  }

  function mention(state) {
    var i, j, l, m,
        currentToken,
        tokens,
        token,
        blockTokens = state.tokens,
        Token = state.Token,
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
        level,
        regex,
        regexGlobal,
        mentionRegExp = '@\\{([^;]+); ([^\\}]+)\\}';

    regex       = new RegExp(mentionRegExp);
    regexGlobal = new RegExp(mentionRegExp, 'g');

    for (j = 0, l = blockTokens.length; j < l; j++) {
      if (blockTokens[j].type !== 'inline') { continue; }

      tokens = blockTokens[j].children;

      htmlLinkLevel = 0;

      for (i = tokens.length - 1; i >= 0; i--) {
        currentToken = tokens[i];

        // skip content of markdown links
        if (currentToken.type === 'link_close') {
          i--;
          while (tokens[i].level !== currentToken.level && tokens[i].type !== 'link_open') {
            i--;
          }
          continue;
        }

        // skip content of html links
        if (currentToken.type === 'html_inline') {
          // we are going backwards, so isLinkOpen shows end of link
          if (isLinkOpen(currentToken.content) && htmlLinkLevel > 0) {
            htmlLinkLevel--;
          }
          if (isLinkClose(currentToken.content)) {
            htmlLinkLevel++;
          }
        }
        if (htmlLinkLevel > 0) { continue; }

        if (currentToken.type !== 'text') { continue; }

        // find mentions
        text = currentToken.content;
        matches = text.match(regexGlobal);

        if (matches === null) { continue; }

        nodes = [];
        level = currentToken.level;

        for (m = 0; m < matches.length; m++) {
          match = matches[m].match(regex);
          pos = text.indexOf(matches[m]);
          name       = match[1];
          diasporaId = match[2];
          linkclass = 'mention';

          if (pos > 0) {
            token         = new Token('text', '', 0);
            token.content = text.slice(0, pos);
            token.level   = level;
            nodes.push(token);
          }


          person = findPersonById(diasporaId);

          if (person) {
            if (allowHovercards && person.guid !== currentUserId) {
              linkclass += ' hovercardable';
            }

            token           = new Token('mention_open', '', 1);
            token.content   = person.url || '/people/' + person.guid;
            token.linkclass = linkclass;
            token.level     = level++;
            nodes.push(token);

            token           = new Token('mention_text', '', 0);
            token.content   = escapeHtml(name).trim();
            token.level     = level;
            nodes.push(token);

            token           = new Token('mention_close', '', -1);
            token.level     = --level;
            nodes.push(token);

          } else {
            token         = new Token('text', '', 0);
            token.content = name;
            token.level   = level;
            nodes.push(token);
          }
          text = text.slice(pos + match[0].length);
        }

        if (text.length > 0) {
          token         = new Token('text', '', 0);
          token.content = text;
          token.level   = state.level;
          nodes.push(token);
        }

        // replace current node
        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
      }
    }
  }

  md.core.ruler.after('inline', 'mention', mention);
  md.renderer.rules.mention_open  = mention_open;
  md.renderer.rules.mention_text  = mention_text;
  md.renderer.rules.mention_close = mention_close;
};
