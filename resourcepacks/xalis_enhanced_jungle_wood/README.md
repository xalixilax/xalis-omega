# xalis_enhanced_jungle_wood

"xali's Enhanced Jungle Wood" recolors every jungle wood texture to match the
color of the note block.

To build:

```bash
bun install
bun run build
```

The generator fetches vanilla jungle textures for
`globalConfig.minecraftVersion`, swaps their colors to the note block palette,
and writes the result to the configured resource pack output.

To tune the look, edit `noteBlockPalette` and `jungleTextures` in
`generate.ts`, then rebuild.