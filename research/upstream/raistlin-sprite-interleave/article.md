# Sprite Interleave

- URL: https://c64demo.com/sprite-interleave/
- Author: Raistlin (Genesis Project)
- Published: 2026-10-12
- Level: intermediate
- Tags: 6502, c64, sprites, multiplexing, badlines, raster irqs
- Licence: CC BY 4.0 for text, CC BY 4.0 or MIT for code (https://creativecommons.org/licenses/by/4.0/)
- Releases: The Dive by Genesis Project (2019) https://csdb.dk/release/?id=179128; Memento Mori by Genesis Project (2020) https://csdb.dk/release/?id=195841

> A gap-free carpet of sprites on the C64: no interleave against 16px and 20px interleave, badline timing, and fast sprite pointer updates.

Assumes: Badlines and what the VIC fetches on them; Stable raster IRQs

## Summary

A while back I wrote an article on [Codebase64](https://codebase64.net/doku.php?id=base:sprite_interleave) about sprite interleave. Re-reading it, even I found it confusing :') So this is a rewrite, with a lot more explanation and some new diagrams.

The problem it solves: you want a big block of sprites, say 8 across and 10 down, covering most of the screen with no gaps and no glitches. We used this in the intro of The Dive (sprites over a bitmap upscroller) and for the swinging Genesis Project logo in Memento Mori (the header image above shows both).

There are three ways to lay the sprites out - no interleave, 16-pixel interleave and 20-pixel interleave - and I'll go through each of them. Then there are a couple of tricks for updating the sprite pointers quickly, which work with any of the three.

The 20-pixel interleave is the one I use most. The original idea, and a lot of help getting it working, came from **Christopher Jam**.

---

## The Problem

The C64 only has 8 sprites. To cover the screen with them, we reuse the same 8 sprites further down the screen. Each time a row of sprites finishes, we:

- move all 8 sprites down to the next row (their Y positions);
- point all 8 sprites at new graphics (their sprite pointers, the 8 bytes at screen + $3f8).

The Y positions are easy. You can set them any time while the current row is being drawn, and the VIC only acts on them once the sprite has finished.

The sprite pointers are the hard part. They need to change at the right moment, and writing all 8 of them one at a time takes 34-42 cycles.

And every 8 rasterlines there's a badline. On a badline the VIC takes 40 cycles of the line to fetch character data. With all 8 sprites switched on it takes their data as well, which leaves the CPU with next to nothing. If the pointers need to change on a badline, there's no way to get those writes in.

---

## Changing a Pointer Mid-Sprite

Before going any further, there's one thing you need to know.

The VIC reads every sprite's pointer on every rasterline. It also keeps its own count of which line of the sprite it's on (0 to 20). Changing the pointer doesn't reset that count. The sprite just carries on from the same line, reading from the new block.

So if you change a sprite from block 64 to block 72 while the VIC is on line 6, you get lines 0-5 of block 64, then lines 6-20 of block 72:-

![Changing a sprite pointer partway down a sprite](https://c64demo.com/img/1TmBnYhHnG-2200.png)

This is the key to interleave. A sprite pointer change doesn't have to happen between two sprites. It can happen anywhere, as long as the data in the new block is laid out to match the line the VIC is on.

---

## Interleave

So here's the idea:-

- the sprites themselves still restart every 21 lines, as normal (we keep updating the Y positions);
- the sprite pointers change more often than that - every 20 lines, or every 16;
- each block of sprite data is "rolled" to line up with wherever the VIC happens to be in the sprite when that block comes on screen.

Each block still holds 21 lines, but only moves us 20 (or 16) lines down the screen. So neighbouring blocks overlap: with 20-pixel interleave they share 1 line, and with 16-pixel interleave they share 5. On those shared lines, both blocks hold the same data.

And that's what makes it work. On a shared line, it doesn't matter which block a sprite is showing - the picture is the same. So the pointer writes don't need to land at one exact moment. They just need to land somewhere within the shared lines. That's our window.

Here's where that window falls for each method, against the badlines:-

![Where the sprite pointers can change for no interleave, 20px and 16px interleave, plotted against badlines](https://c64demo.com/img/7Sz1rCkz3f-2420.png)

<details><summary>Same data as a table</summary>

Rasterlines are counted from the top of the sprite carpet, with badlines at 1, 9, 17 and so on, every 8 lines. The window starts at the pointer change.

| Method | Pointer changes at rasterline | Window | Only on a badline |
|:---|:---|:---|:---|
| no interleave | 21, 42, 63, 84, 105, 126, 147, 168, 189 | none | 105 |
| 20px interleave | 20, 40, 60, 80, 100, 120, 140, 160, 180 | 1 line | none |
| 16px interleave | 16, 32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192 | 5 lines | none |

</details>

---

## No Interleave

The simplest option. Each block is a normal sprite, and the pointers change every 21 lines, exactly as one row ends and the next begins.

There's no shared line, so there's no window. The writes have to fit between the last line of one row and the first line of the next.

Worse, with rows every 21 lines, that moment moves 5 lines further through the character row each time (21 = 2 x 8 + 5). After 8 rows it has been through every position, so at least one row change is going to land on a badline. You can see it in the diagram above. On that row, you'll get glitches.

It gets worse again with a vertically scrolling screen, as in The Dive, because changing $d011 moves the badlines around underneath you.

---

## 16-pixel Interleave

Here the pointers change every 16 lines, and neighbouring blocks share 5 lines.

That's a 5-line window to get the 8 pointer writes in, which is very forgiving. Badlines are 8 lines apart, so there's never more than 1 badline in the window. There's always plenty of time on the other lines, wherever $d011 puts the badlines.

The cost is memory. Each block only moves us 16 lines down the screen, so a 200-line screen needs 13 rows of blocks: 104 sprites in all, rather than 80. And 5 of the 21 lines in every block are copies:-

![Which image line is stored in each sprite line of each of the 13 blocks for 16px interleave](https://c64demo.com/img/WvUZr_aowt-3146.png)

<details><summary>Same data as a table</summary>

Each cell is the image line stored in that sprite line of that block (B0 = block 0). `*` marks a line stored in two neighbouring blocks, `-` a line below the bottom of the screen.

| Sprite line | B0 | B1 | B2 | B3 | B4 | B5 | B6 | B7 | B8 | B9 | B10 | B11 | B12 |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 0 | 21 | 42 | 63 | 84* | 84* | 105 | 126 | 147* | 147* | 168 | 189 | - |
| 1 | 1 | 22 | 43 | 64* | 64* | 85 | 106 | 127 | 148* | 148* | 169 | 190 | - |
| 2 | 2 | 23 | 44 | 65* | 65* | 86 | 107 | 128* | 128* | 149 | 170 | 191 | - |
| 3 | 3 | 24 | 45 | 66* | 66* | 87 | 108 | 129* | 129* | 150 | 171 | 192* | 192* |
| 4 | 4 | 25 | 46 | 67* | 67* | 88 | 109 | 130* | 130* | 151 | 172 | 193* | 193* |
| 5 | 5 | 26 | 47 | 68* | 68* | 89 | 110 | 131* | 131* | 152 | 173 | 194* | 194* |
| 6 | 6 | 27 | 48* | 48* | 69 | 90 | 111 | 132* | 132* | 153 | 174 | 195* | 195* |
| 7 | 7 | 28 | 49* | 49* | 70 | 91 | 112* | 112* | 133 | 154 | 175 | 196* | 196* |
| 8 | 8 | 29 | 50* | 50* | 71 | 92 | 113* | 113* | 134 | 155 | 176* | 176* | 197 |
| 9 | 9 | 30 | 51* | 51* | 72 | 93 | 114* | 114* | 135 | 156 | 177* | 177* | 198 |
| 10 | 10 | 31 | 52* | 52* | 73 | 94 | 115* | 115* | 136 | 157 | 178* | 178* | 199 |
| 11 | 11 | 32* | 32* | 53 | 74 | 95 | 116* | 116* | 137 | 158 | 179* | 179* | - |
| 12 | 12 | 33* | 33* | 54 | 75 | 96* | 96* | 117 | 138 | 159 | 180* | 180* | - |
| 13 | 13 | 34* | 34* | 55 | 76 | 97* | 97* | 118 | 139 | 160* | 160* | 181 | - |
| 14 | 14 | 35* | 35* | 56 | 77 | 98* | 98* | 119 | 140 | 161* | 161* | 182 | - |
| 15 | 15 | 36* | 36* | 57 | 78 | 99* | 99* | 120 | 141 | 162* | 162* | 183 | - |
| 16 | 16* | 16* | 37 | 58 | 79 | 100* | 100* | 121 | 142 | 163* | 163* | 184 | - |
| 17 | 17* | 17* | 38 | 59 | 80* | 80* | 101 | 122 | 143 | 164* | 164* | 185 | - |
| 18 | 18* | 18* | 39 | 60 | 81* | 81* | 102 | 123 | 144* | 144* | 165 | 186 | - |
| 19 | 19* | 19* | 40 | 61 | 82* | 82* | 103 | 124 | 145* | 145* | 166 | 187 | - |
| 20 | 20* | 20* | 41 | 62 | 83* | 83* | 104 | 125 | 146* | 146* | 167 | 188 | - |

</details>

---

## 20-pixel Interleave

Here the pointers change every 20 lines, and neighbouring blocks share 1 line.

Because the pointers change 1 line sooner each time, each change lands 1 line earlier in the sprite. The first change happens on sprite line 20, the next on line 19, then 18, and so on:-

![Rasterlines, sprite lines and which block is on screen for the first four rows](https://c64demo.com/img/z1LVV39oBK-1760.png)

<details><summary>Same data as a table</summary>

The VIC restarts the sprite at sprite line 0 every 21 rasterlines; the pointers move on to the next block every 20.

| Block | Rasterlines | Sprite lines | Shared with the next block |
|:---|:---|:---|:---|
| 0 | 0-20 | 0-20 | sprite line 20 (rasterline 20) |
| 1 | 20-40 | 20, 0-19 | sprite line 19 (rasterline 40) |
| 2 | 40-60 | 19-20, 0-18 | sprite line 18 (rasterline 60) |
| 3 | 60-80 | 18-20, 0-17 | - |

</details>

Follow the "sprite line" column down. At rasterline 21 the VIC restarts the sprite at line 0, but block 1 has been on screen since rasterline 20. So block 1 starts at sprite line 20, then wraps round to 0, 1, 2 ...

Those orange lines are the shared lines. At rasterline 20, the VIC is on sprite line 20, so line 20 of block 0 and line 20 of block 1 must be identical. At rasterline 40 it's sprite line 19 of blocks 1 and 2, and so on.

### Why the Shared Line Matters

The 8 pointer writes don't all happen at the same moment. Even with the fastest code (below) they're spread over 34 cycles, which is more than half a rasterline. So some sprites will pick up their new pointer in time for the shared line, and some won't get it until the line after.

Here's what you'd see if the blocks didn't share that line (a simulation, with sprites 2, 3, 6 and 7 picking up their pointers late and showing an empty line). On the left the shared lines are missing, on the right they're there:-

![Simulated glitch lines with and without the shared line](https://c64demo.com/img/z8vCAI_pgF-1176.png)
*Simulated: without the shared line (left) and with it (right)*

A 1-line window is tight. Your pointer writes need to be timed to the cycle, so that every sprite picks up its new pointer either on the shared line or the line after it.

### Dodging the Badlines

With a change every 20 lines, the window only ever lands in two places in the character row, 4 lines apart (20 = 2 x 8 + 4). Look at the 20px row in the badline diagram: once you've placed those two clear of the badlines, they stay clear all the way down the screen.

### Laying Out the Data

Put all that together and the rule for where each line of your image goes is short:-

- image line **y** goes in sprite line **y mod 21** of block **y / 20** (rounded down);
- if **y** is a multiple of 20, it also goes in the same sprite line of the block before.

For a 200-line screen that gives 10 blocks per column of sprites. Here's every line of every block:-

![Which image line is stored in each sprite line of each of the 10 blocks](https://c64demo.com/img/ixx8px46yu-2420.png)

<details><summary>Same data as a table</summary>

Each cell is the image line stored in that sprite line of that block (B0 = block 0). `*` marks a line stored in two neighbouring blocks, `-` a line below the bottom of the screen.

| Sprite line | B0 | B1 | B2 | B3 | B4 | B5 | B6 | B7 | B8 | B9 |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 0 | 21 | 42 | 63 | 84 | 105 | 126 | 147 | 168 | 189 |
| 1 | 1 | 22 | 43 | 64 | 85 | 106 | 127 | 148 | 169 | 190 |
| 2 | 2 | 23 | 44 | 65 | 86 | 107 | 128 | 149 | 170 | 191 |
| 3 | 3 | 24 | 45 | 66 | 87 | 108 | 129 | 150 | 171 | 192 |
| 4 | 4 | 25 | 46 | 67 | 88 | 109 | 130 | 151 | 172 | 193 |
| 5 | 5 | 26 | 47 | 68 | 89 | 110 | 131 | 152 | 173 | 194 |
| 6 | 6 | 27 | 48 | 69 | 90 | 111 | 132 | 153 | 174 | 195 |
| 7 | 7 | 28 | 49 | 70 | 91 | 112 | 133 | 154 | 175 | 196 |
| 8 | 8 | 29 | 50 | 71 | 92 | 113 | 134 | 155 | 176 | 197 |
| 9 | 9 | 30 | 51 | 72 | 93 | 114 | 135 | 156 | 177 | 198 |
| 10 | 10 | 31 | 52 | 73 | 94 | 115 | 136 | 157 | 178 | 199 |
| 11 | 11 | 32 | 53 | 74 | 95 | 116 | 137 | 158 | 179 | - |
| 12 | 12 | 33 | 54 | 75 | 96 | 117 | 138 | 159 | 180* | 180* |
| 13 | 13 | 34 | 55 | 76 | 97 | 118 | 139 | 160* | 160* | 181 |
| 14 | 14 | 35 | 56 | 77 | 98 | 119 | 140* | 140* | 161 | 182 |
| 15 | 15 | 36 | 57 | 78 | 99 | 120* | 120* | 141 | 162 | 183 |
| 16 | 16 | 37 | 58 | 79 | 100* | 100* | 121 | 142 | 163 | 184 |
| 17 | 17 | 38 | 59 | 80* | 80* | 101 | 122 | 143 | 164 | 185 |
| 18 | 18 | 39 | 60* | 60* | 81 | 102 | 123 | 144 | 165 | 186 |
| 19 | 19 | 40* | 40* | 61 | 82 | 103 | 124 | 145 | 166 | 187 |
| 20 | 20* | 20* | 41 | 62 | 83 | 104 | 125 | 146 | 167 | 188 |

</details>

- block 0 is a normal sprite: image lines 0-20;
- every block after that is rolled, starting part-way down the sprite;
- each block has one line in common with the block before it (orange);
- the last block only needs 20 lines, as image line 200 is off the bottom of the screen.

The same rule works for 16-pixel interleave: swap the 20 for 16, and every block shares 5 lines with the block before rather than 1.

For a working example of the IRQ side of this, see my [Big Animating Sprite Logo](/big-animating-sprite-logo/) post. That's the Memento Mori logo from the header image. Its IRQs are 20 lines apart, and each one sets the next row's Y positions and then the 8 sprite pointers at an exact point on the rasterline.

---

## Pros and Cons

| | No interleave | 16-pixel | 20-pixel |
|:---|:---|:---|:---|
| Pointers change every | 21 lines | 16 lines | 20 lines |
| Window for the pointer writes | none | 5 lines | 1 line |
| Badlines | glitches where a row change lands on one | always avoidable | avoidable, with careful timing |
| Rows to cover 200 lines | 10 (80 sprites) | 13 (104 sprites) | 10 (80 sprites) |
| Copied lines per block | none | 5 | 1 |
| Complexity | simplest | rolled data | rolled data and tight timing |

In short:-

- **no interleave** is the simplest, but it will glitch wherever a row change hits a badline;
- **16-pixel interleave** never glitches and is very forgiving on timing, but it needs 13 rows of sprites to cover the screen;
- **20-pixel interleave** never glitches and needs only 10 rows, but the timing is tight.

One more cost to bear in mind with both interleaves: if you're drawing into the sprites in realtime, as we were with the Memento Mori logo, every write that lands on a shared line has to be done twice.

---

## Updating the Sprite Pointers Quickly

Whichever method you use, you'll want to update all 8 sprite pointers in as few cycles as possible. That's especially true for 20-pixel interleave, and when you're also opening the side borders or doing other timed work on the same lines.

### The Obvious Way

```asm6502
		ldx #$40
		stx ScreenAddr + $3f8 + 0
		inx
		stx ScreenAddr + $3f8 + 1
		inx
		stx ScreenAddr + $3f8 + 2
		inx
		stx ScreenAddr + $3f8 + 3
		inx
		stx ScreenAddr + $3f8 + 4
		inx
		stx ScreenAddr + $3f8 + 5
		inx
		stx ScreenAddr + $3f8 + 6
		inx
		stx ScreenAddr + $3f8 + 7
```

What matters is the time from the first write to the last, as that's the window in which the sprites are switching over. Here that's 7 INX (2 cycles each) and 7 STX (4 cycles each) = 42 cycles.

### Using SAX

We can do better with the illegal opcode SAX, which stores A AND X:-

```asm6502
		ldx #64 + 4
		lda #$fb
		sax ScreenAddr + $3f8 + 0	//; writes X AND A = 68 AND $fb = 64
		stx ScreenAddr + $3f8 + 4	//; 68
		inx
		sax ScreenAddr + $3f8 + 1	//; 65
		stx ScreenAddr + $3f8 + 5	//; 69
		inx
		sax ScreenAddr + $3f8 + 2	//; 66
		stx ScreenAddr + $3f8 + 6	//; 70
		inx
		sax ScreenAddr + $3f8 + 3	//; 67
		stx ScreenAddr + $3f8 + 7	//; 71
```

$fb is every bit except bit 2 (which is worth 4). So each SAX writes X with 4 taken off, and each STX writes X as it is. One INX moves both sprites on at once. From the first write to the last, that's 7 stores (4 cycles each) and 3 INX (2 cycles each) = 34 cycles. We've saved 8 cycles, which matters a lot in code like this.

The one requirement: the first pointer of the 8 needs to be a multiple of 8, so that bit 2 starts clear. Then the AND only ever removes the 4 we added.

### Using $d018

The fastest way of all is not to write the sprite pointers at the moment of the change. Instead, you switch screens:-

- you have two screens, each with its own set of sprite pointers;
- while one is on show, you write the next row's pointers into the other, in your own time;
- at the moment of the change, one write to $d018 switches the VIC over to the other screen, and all 8 pointers change at once.

This works with any of the three methods above. With 20-pixel interleave, for example, it takes the pressure off that 1-line window, as the whole change is a single write.

The catch is the second screen. The VIC also reads its characters (or, in bitmap mode, its colours) from whichever screen is on show, so both screens need the same content. That's another 1KB of memory, and your screen setup and any screen drawing code have to handle both. If all you have on screen is sprites - as in the Sprites Only Compo - that doesn't matter, and $d018 is a great way to do it. Otherwise, memory can quickly become a concern.

---

## Wrapping Up

The whole thing comes down to two ideas:-

- you can change a sprite's pointer partway down the sprite, as long as the new block's data is rolled to match;
- if neighbouring blocks share a line or more, it doesn't matter exactly when each pointer changes, as long as it's somewhere within those shared lines.

Pick your interleave based on how much memory you can spare and how tight your timing can be. Then pick how you update the pointers - plain writes, SAX or $d018 - based on how many cycles you need to save and whether you can afford a second screen.

Thanks again to **Christopher Jam** for the original idea.

Until next time!
