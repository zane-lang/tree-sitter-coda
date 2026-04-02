/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "coda",

  // Spaces/tabs are ignorable; newlines are significant in Coda.
  extras: $ => [/[\t ]+/],

  rules: {
    source_file: $ => seq(
      repeat($._line),
      optional($._final_line)
    ),

    _line: $ => choice(
      $.pair_line,
      $.comment_line,
      $.blank_line
    ),

    _final_line: $ => choice(
      $.pair,     // allow EOF without trailing newline
      $.comment
    ),

    // -------------------------
    // Line kinds (own newlines)
    // -------------------------
    blank_line: $ => $.newline,
    comment_line: $ => seq($.comment, $.newline),
    pair_line: $ => seq($.pair, $.newline),

    // Used inside arrays/tables to represent "whole trivia lines"
    trivia_line: $ => choice($.comment_line, $.blank_line),

    // -------------------------
    // Pairs
    // -------------------------
    pair: $ => choice($.pair_scalar, $.pair_container),

    pair_scalar: $ => seq(
      field("key", $.key),
      field("value", $.scalar),
      optional($.comment)
    ),

    pair_container: $ => seq(
      field("key", $.key),
      field("value", choice($.block, $.array)),
      optional($.comment)
    ),

    // Keys can be quoted; bare `key` is reserved in Coda, so we enforce that
    // by giving `key_kw` higher lexical precedence than `bare_string`.
    key: $ => choice($.quoted_string, $.bare_string),
    scalar: $ => choice($.quoted_string, $.bare_string),

    // -------------------------
    // Block (no trailing newline here)
    // -------------------------
    block: $ => seq(
      "{",
      optional($.comment),
      $.newline,
      repeat(choice($.pair_line, $.comment_line, $.blank_line)),
      "}"
    ),

    // -------------------------
    // Array (mode inferred)
    //
    // Key idea: array consumes LEADING trivia lines, then commits to a body.
    // The body consumes any remaining trivia lines up to the closing `]`.
    // -------------------------
    array: $ => seq(
      "[",
      optional($.comment),
      $.newline,

      // Eat all leading trivia lines here (so bodies never start with trivia)
      repeat($.trivia_line),

      // Now we can decide mode using the first non-trivia line
      optional($.array_body),

      "]"
    ),

    array_body: $ => choice(
      $.keyed_table,
      $.plain_table,
      $.bare_list
    ),

    // -------------------------
    // Bare list: exactly one element per line
    // (element may be scalar or nested container)
    //
    // IMPORTANT: bare_list MUST start with an item line (not a trivia line),
    // otherwise we'd reintroduce your conflict.
    // -------------------------
    bare_list: $ => seq(
      $.list_item_line,
      repeat(choice($.list_item_line, $.trivia_line))
    ),

    list_item_line: $ => seq($.list_item, optional($.comment), $.newline),
    list_item: $ => choice($.scalar, $.block, $.array),

    // -------------------------
    // Plain table: header is 2+ scalars on one line
    // Rows are 1+ scalars (you can tighten later)
    // Nesting is forbidden by construction because rows only accept `scalar`.
    // -------------------------
    plain_table: $ => seq(
      $.plain_header_line,
      repeat(choice($.plain_row_line, $.trivia_line))
    ),

    plain_header_line: $ => seq($.plain_header, $.newline),
    plain_header: $ => seq(
      field("column", $.scalar),
      field("column", $.scalar),        // guarantees 2+ tokens
      repeat(field("column", $.scalar)),
      optional($.comment)
    ),

    plain_row_line: $ => seq($.plain_row, $.newline),
    plain_row: $ => seq(
      field("cell", $.scalar),
      repeat(field("cell", $.scalar)),
      optional($.comment)
    ),

    // -------------------------
    // Keyed table: first token is keyword `key`
    // -------------------------
    keyed_table: $ => seq(
      $.keyed_header_line,
      repeat(choice($.keyed_row_line, $.trivia_line))
    ),

    keyed_header_line: $ => seq($.keyed_header, $.newline),
    keyed_header: $ => seq(
      $.key_kw,
      field("column", $.scalar),
      repeat(field("column", $.scalar)),
      optional($.comment)
    ),

    keyed_row_line: $ => seq($.keyed_row, $.newline),
    keyed_row: $ => seq(
      field("row_key", $.scalar),
      field("cell", $.scalar),
      repeat(field("cell", $.scalar)),
      optional($.comment)
    ),

    // -------------------------
    // Tokens
    // -------------------------
    newline: _ => token(/\r?\n/),
    comment: _ => token(seq("#", /[^\r\n]*/)),

    // Reserved keyword `key` (Coda: bare `key` is not a normal identifier)
    // Using token(prec(N, ...)) is the documented way to give lexical precedence. <!--citation:3-->
    key_kw: _ => token(prec(1, "key")),

    // Bare strings can contain any chars except whitespace and syntax chars {}[]"# (per Coda README). <!--citation:2-->
    bare_string: _ => token(prec(0, /[^\s{}\[\]"#]+/)),

    quoted_string: _ => token(seq(
      '"',
      repeat(choice(
        /[^"\\\r\n]+/,
        /\\[ntr"\\]/,
        /\\./
      )),
      '"'
    )),
  }
});
