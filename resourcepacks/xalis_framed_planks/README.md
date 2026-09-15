# xalis_framed_planks

"xali's Framed Planks" gives the double slab a unique framed texture.

To build:

```bash
bun install
bun run build
```

The pack is generated from the `PLANKS` block category. Every plank wood
with a slab gets:

- `assets/minecraft/blockstates/<wood>_slab.json` (routes `type=double`)
- `assets/minecraft/models/block/<wood>_framed_planks.json`
- `assets/minecraft/textures/block/<wood>_framed_planks.png` (from `textures/`)

Drop a texture at `textures/<wood>_framed_planks.png` and rebuild to add it.