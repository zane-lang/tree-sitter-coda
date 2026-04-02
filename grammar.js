/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
	name: "coda",

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
			$.pair,
			$.comment
		),

		blank_line: $ => $.newline,
		comment_line: $ => seq($.comment, $.newline),
		pair_line: $ => seq($.pair, $.newline),

		trivia_line: $ => choice($.comment_line, $.blank_line),

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

		key: $ => choice($.key_quoted_string, $.key_bare_string),
		scalar: $ => choice($.value_quoted_string, $.value_bare_string),

		block: $ => seq(
			"{",
			optional($.comment),
			$.newline,
			repeat(choice($.pair_line, $.comment_line, $.blank_line)),
			"}"
		),

		array: $ => seq(
			"[",
			optional($.comment),
			$.newline,
			repeat($.trivia_line),
			optional($.array_body),
			"]"
		),

		array_body: $ => choice(
			$.keyed_table,
			$.plain_table,
			$.bare_list
		),

		bare_list: $ => seq(
			$.list_item_line,
			repeat(choice($.list_item_line, $.trivia_line))
		),

		list_item_line: $ => seq($.list_item, optional($.comment), $.newline),
		list_item: $ => choice($.scalar, $.block, $.array),

		plain_table: $ => seq(
			$.plain_header_line,
			repeat(choice($.plain_row_line, $.trivia_line))
		),

		plain_header_line: $ => seq($.plain_header, $.newline),
		plain_header: $ => seq(
			field("column", $.key),
			field("column", $.key),
			repeat(field("column", $.key)),
			optional($.comment)
		),

		plain_row_line: $ => seq($.plain_row, $.newline),
		plain_row: $ => seq(
			field("cell", $.scalar),
			repeat(field("cell", $.scalar)),
			optional($.comment)
		),

		keyed_table: $ => seq(
			$.keyed_header_line,
			repeat(choice($.keyed_row_line, $.trivia_line))
		),

		keyed_header_line: $ => seq($.keyed_header, $.newline),
		keyed_header: $ => seq(
			$.key_kw,
			field("column", $.key),
			repeat(field("column", $.key)),
			optional($.comment)
		),

		keyed_row_line: $ => seq($.keyed_row, $.newline),
		keyed_row: $ => seq(
			field("row_key", $.key),
			field("cell", $.scalar),
			repeat(field("cell", $.scalar)),
			optional($.comment)
		),

		newline: _ => token(/\r?\n/),
		comment: _ => token(seq("#", /[^\r\n]*/)),

		key_kw: _ => token(prec(1, "key")),

		key_bare_string: _ => token(prec(0, /[^\s{}\[\]"#]+/)),
		key_quoted_string: _ => token(seq(
			'"',
			repeat(choice(
				/[^"\\\r\n]+/,
				/\\[ntr"\\]/,
				/\\./
			)),
			'"'
		)),

		value_bare_string: _ => token(prec(0, /[^\s{}\[\]"#]+/)),
		value_quoted_string: _ => token(seq(
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
