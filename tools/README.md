# Host tools and third-party boundary

## `convert-image.ps1`

This project helper samples an image into a centered 320x200 canvas, chooses an
alpha mask or weighted RGB threshold, optionally inverts the fitted foreground,
and packs the result into an 8000-byte VIC-II bitmap. It samples with nearest
neighbors to keep the conversion deterministic and avoid additional packages.
It uses Windows System.Drawing and is not a cross-platform image decoder.

Auto mode looks for any transparency in the sampled image before choosing its
mask rule. For semitransparent photographic content, choose Luma explicitly if
you want tonal detail rather than an alpha silhouette. The weighted RGB formula
is evaluated directly on the source channel values; it is not gamma-linearized.

## `64tass/`

This is the unchanged upstream 64tass 1.60.3243 Windows distribution. The
assembler encodes instructions and resolves symbols through assembly passes;
its implementation and supported CPUs are documented in the supplied manual.
It is a host tool, not a library linked into the C64 demo.

- `64tass.exe` is the compiler executable used by the builder.
- `README`, `README.md`, `README.html` and `manual.pdf` are upstream documentation.
- `NEWS` records upstream changes.
- `LICENSE-*` files preserve upstream license terms and component notices.
- `examples/` contains upstream assembly examples, each with its own source
  comments. They are not included by `demo.asm`.
- `syntax/` contains editor highlighting/build definitions. These describe
  assembly tokens to editors; they do not implement the demo or compiler.

Project algorithm comments are added to project-owned files, not to vendor
files, so the original documentation and attribution remain intact. See the
[file catalog](../docs/FILES.md) for each bundled path.
