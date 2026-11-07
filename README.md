# tree-sitter-coda

A [Tree-sitter](https://tree-sitter.github.io/) grammar for
[Coda](https://github.com/zane-lang/coda), the configuration format of Zane's
`zane.coda` and `zane-lock.coda` files. It gives editors that use Tree-sitter
syntax highlighting, folding and indentation for `.coda` files.

| File | What it is |
|---|---|
| [`grammar.js`](grammar.js) | The grammar; `src/` is generated from it |
| [`queries/highlights.scm`](queries/highlights.scm) | Highlighting: keys, values, comments, brackets, and the `key` of a keyed-table header |
| [`queries/folds.scm`](queries/folds.scm) | Folding of blocks and arrays |
| [`queries/indents.scm`](queries/indents.scm) | Indentation inside blocks and arrays |

## Neovim

You need [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter)
(the `main` branch), the
[Tree-sitter CLI](https://github.com/tree-sitter/tree-sitter/tree/master/crates/cli)
and a C compiler. Tell Neovim about the filetype and register the parser,
then install it:

```lua
vim.filetype.add({ extension = { coda = "coda" } })

vim.api.nvim_create_autocmd("User", {
  pattern = "TSUpdate",
  callback = function()
    require("nvim-treesitter.parsers").coda = {
      install_info = {
        url = "https://github.com/zane-lang/tree-sitter-coda",
        queries = "queries",
      },
    }
  end,
})
```

```vim
:TSInstall coda
```

Highlighting then starts like any other nvim-treesitter language (for example
with `vim.treesitter.start()` in a `FileType coda` autocommand).

## Other editors

Any editor that loads Tree-sitter grammars can use this one: point it at this
repository, with `queries/` as the query directory. `tree-sitter.json` names
the language `coda`, with the scope `source.coda` and the file type `coda`.

## Development

```sh
tree-sitter generate                  # regenerate src/ after editing grammar.js
tree-sitter parse tests/example.coda  # print the tree for the example file
```

The format itself is defined in Coda's
[`docs/SPEC.md`](https://github.com/zane-lang/coda/blob/main/docs/SPEC.md); a
change there that adds syntax needs a matching change to `grammar.js`.
