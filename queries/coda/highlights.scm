["{" "}" "[" "]"] @punctuation.bracket
(key_kw) @keyword
(comment) @comment

(quoted_string) @string
(bare_string) @string

(pair_scalar key: (_) @property)
(pair_container key: (_) @property)

(keyed_header "key" @keyword)

(plain_header column: (_) @markup.heading)
(keyed_header column: (_) @markup.heading)

(keyed_row row_key: (_) @variable.member)
