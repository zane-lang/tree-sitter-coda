# tree-sitter-coda

[Tree-sitter](https://tree-sitter.github.io/) grammar for [Coda](https://github.com/zane-lang/coda), a compact configuration format.

## Usage

### Neovim

First associate the filetype:

```lua
vim.filetype.add({ extension = { coda = "coda" } })
```

Then add the parser to your nvim-treesitter config:

```lua
vim.api.nvim_create_autocmd('User', {
    pattern = 'TSUpdate',
    callback = function()
        require('nvim-treesitter.parsers').coda = {
            install_info = {
                url = 'https://github.com/zane-lang/tree-sitter-coda',
                queries = "queries",
            },
        }
    end,
})
```
