require("core-js/fn/array/find");

const mentionOpen = (tokens, idx) => `<a href="${tokens[idx].content}" class="${tokens[idx].linkclass}">`,
      mentionClose = () => "</a>",
      mentionText = (tokens, idx) => tokens[idx].content,
      linkOpenRegExp = /^<a[>\s]/i,
      linkCloseRegExp = /^<\/a\s*>/i,
      isLinkOpen = (str) => linkOpenRegExp.test(str),
      isLinkClose = (str) => linkCloseRegExp.test(str),
      mentionRegExpPattern = "@\\{(?:[^;]+; )?([^\\} ]+)\\}",
      mentionRegExp = new RegExp(mentionRegExpPattern),
      mentionRegExpGlobal = new RegExp(mentionRegExpPattern, "g");

class MentionPlugin {
  constructor(md, {mentions, allowHovercards, currentUserId} = {mentions: [], allowHovercards: false}) {
    this.mentions = mentions;
    this.allowHovercards = allowHovercards;
    this.currentUserId = currentUserId;
    this.escapeHtml = md.utils.escapeHtml;

    md.core.ruler.after("inline", "mention", this.parseMentions.bind(this));
    /* eslint-disable camelcase */
    md.renderer.rules.mention_open = mentionOpen;
    md.renderer.rules.mention_text = mentionText;
    md.renderer.rules.mention_close = mentionClose;
    /* eslint-enable camelcase */
  }

  findPersonById(id) {
    return this.mentions.find((m) => id === m.diaspora_id || id === m.handle);
  }

  mentionLinkClass(person) {
    return (this.allowHovercards && person.guid !== this.currentUserId) ?
      "mention hovercardable" :
      "mention";
  }

  /*
   * Skips content inside of markdown links (between link_open and link_close)
   * Modifies this.inMarkdownLink and this.markdownLinkStartLevel to keep track of the current state
   */
  skipMarkdownLink(currentToken) {
    if (this.inMarkdownLink) {
      if (currentToken.level === this.markdownLinkStartLevel || currentToken.type === "link_close") {
        this.inMarkdownLink = false;
      }
      return true;
    }
    if (currentToken.type === "link_open") {
      this.markdownLinkStartLevel = currentToken.level;
      this.inMarkdownLink = true;
      return true;
    }
    return false;
  }

  /*
   * Skips content inside of inline html links
   * Modifies this.htmlLinkLevel to keep track of the current state
   */
  skipHtmlLink(currentToken) {
    if (currentToken.type === "html_inline") {
      if (isLinkClose(currentToken.content) && this.htmlLinkLevel > 0) {
        this.htmlLinkLevel--;
      }
      if (isLinkOpen(currentToken.content)) {
        this.htmlLinkLevel++;
      }
    }
    return this.htmlLinkLevel > 0;
  }

  /*
   * Returns a list of the tokens needed for rendering all mentions inside of the current token
   */
  mentionTokens(currentToken, state) {
    let text = currentToken.content,
        level = currentToken.level,
        tokens = [],
        token;
    const matches = text.match(mentionRegExpGlobal);

    if (matches === null) {
      return [currentToken];
    }

    matches.forEach((match) => {
      let [matchedText, diasporaId] = match.match(mentionRegExp),
          pos = text.indexOf(match);

      if (pos > 0) {
        token = new state.Token("text", "", 0);
        token.content = text.slice(0, pos);
        token.level = level;
        tokens.push(token);
      }

      const person = this.findPersonById(diasporaId);

      if (person) {
        token = new state.Token("mention_open", "", 1);
        token.content = person.url || "/people/" + person.guid;
        token.linkclass = this.mentionLinkClass(person);
        token.level = level++;
        tokens.push(token);

        token = new state.Token("mention_text", "", 0);
        token.content = this.escapeHtml(person.name).trim();
        token.level = level;
        tokens.push(token);

        token = new state.Token("mention_close", "", -1);
        token.level = --level;
        tokens.push(token);
      } else {
        token = new state.Token("text", "", 0);
        token.content = diasporaId;
        token.level = level;
        tokens.push(token);
      }
      text = text.slice(pos + matchedText.length);
    });

    if (text.length > 0) {
      token = new state.Token("text", "", 0);
      token.content = text;
      token.level = state.level;
      tokens.push(token);
    }

    return tokens;
  }

  parseMentions(state) {
    state.tokens.forEach((blockToken) => {
      if (blockToken.type !== "inline") {
        return;
      }

      this.inMarkdownLink = false;
      this.htmlLinkLevel = 0;

      blockToken.children = blockToken.children.map((currentToken) => {
        if (this.skipMarkdownLink(currentToken) || this.skipHtmlLink(currentToken) || currentToken.type !== "text") {
          return [currentToken];
        }
        return this.mentionTokens(currentToken, state);
      }).reduce((a, b) => a.concat(b), []);

      return;
    });
  }
}

module.exports = (md, opts) => new MentionPlugin(md, opts);
