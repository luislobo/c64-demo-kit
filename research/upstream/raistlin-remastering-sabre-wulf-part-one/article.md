# Remastering Sabre Wulf - Part One

- URL: https://c64demo.com/remastering-sabre-wulf-part-one/
- Author: Raistlin (Genesis Project)
- Published: 2023-09-13
- Series: Remastering Sabre Wulf
- Level: intermediate
- Tags: 6502, c64, game dev, retro gaming, bitmap
- Licence: CC BY 4.0 for text, CC BY 4.0 or MIT for code (https://creativecommons.org/licenses/by/4.0/)
- Releases: Sabre Wulf Remastered Preview V0.1 by Genesis Project (2022) https://csdb.dk/release/?id=225069; Sabre Wulf Remastered Preview V0.5 by Genesis Project (2025) https://csdb.dk/release/?id=258098

> Starting Sabre Wulf Remastered on the C64: why we rewrote the game, converting the map to LDtk, and a screen blit at twice the speed.

Assumes: Multicolour bitmap mode: bitmap, screen and colour RAM

## Summary

In this series, I plan to (eventually) write about the development work going into Sabre Wulf Remastered, our little fan project where we try to update Sabre Wulf to be a more beautiful, smooth and fun experience for all. A full remaster of the original with hugely improved graphics (by the amazing Jon Eggelton), an amazing new soundtrack and audio (from Marcin Majdzik) and new code from myself.

---

## How It Began

To cut a long story short, I spoke to Jon several years ago after seeing his fantastic picture for Sabre Wulf.. the game was an old favourite of mine, one that I would play at a friend's house on his ZX Spectrum, so this new screen really got me thinking about what was possible.

![Jon's reimagined Sabre Wulf loading screen: the explorer with a torch below the logo in dense jungle](https://c64demo.com/img/hcP2yvZDGj-320.png)

Which was actually part of a whole series of these reimagined loading screens for various retro C64 games... these really showed off his stellar pixel skills. The demoscene hadn't really seen much from Jon prior to these but, wow, everyone was desperate for more.

![Four more of Jon's reimagined loading screens: Yie Ar Kung-Fu, River Raid, Daley Thompson's Decathlon, Fist 2](https://c64demo.com/img/lFy-YWYP_L-652.png)

Anyway, on speaking with Jon, he soon told me that he hadn't just stopped at making the new loading screen for the game - he'd already begun repixelling much of the in-game tiles, too, as well as the player character sprites! My jaw dropped when I saw these... simply, I knew that I -had- to help Jon put these to good use!

---

## The Initial Plan

Originally, I thought that it would be a fairly simple job .. hack the game, find where the graphic tiles are held and replace the data with Jon's graphics. But that's when I started to notice a few problems with how the C64 version of the game was made.

Most notably, the graphic format used, although being multicolour bitmap format - the same as Jon's replacement graphics - there were less colours being used per char square (4x8px MC blocks). Instead of the usual 3 + BKG, there were only 2 + BKG... this allowed some memory to be saved and meant that the COL screen ($d800 data) didn't need to be updated in-game - saving some CPU too.

Also, pretty much all the memory of the C64 was filled .. Sabre Wulf is a large 256-screen game, using bitmap graphics, so you can imagine how much RAM was needed. This was a problem for us as we'd need some extra memory to store the extra colour data that we required.

While digging into all of this, I also noted that the code for blitting the screens as you moved around the map was ... well ... "poor". Basically, it was using pretty THE worst addressing modes for reading and writing every byte of data to draw the screen... I couldn't leave it like that, for sure, if this update was going to be liked by sceners and gamers, I really needed to improve on this.

There were several other things here and there that we noticed .. that some of the characters in the game, in particular the hippo and the sabre wulf itself, were being drawn using blitting rather than using hardware sprites... meaning that, each frame, each of these would need to be erased from their previous screen position and then redrawn in the new - this was happening without any clever beam-chasing techniques so, basically, it flickered like a bugger.

---

## The New Plan

Given all of the above, and several other things, I decided that it would be easier - and much much better - to just remake the game completely. With better techniques we could:-

- bring the new graphics in;
- improve the rendering speed so that it would be much faster and smoother to traverse the map;
- overhaul the control mechanism to make gameplay smoother and more responsive;
- increase the screen resolution - Sabre Wulf on C64 used the same 256x176px screen that the Spectrum version used .. we wanted to push this out to the full 320x200px or as close to that as we could without breaking the game;
- add background music and more fitting sound effects;
- fix a small "hack" that the original game had where the player would be "pushed" slightly (8 pixels, actually) as he entered certain screens. This was a hack by the coders to avoid having to fix a load of the game's screens;
- add new features - such as the "fog of war" map;
- add an intro to the game .. just something to explain in a simple way the predicament that the player is in and how they came to be there..;
- add an outro;
- more.

The one thing that we definitely wanted to keep the same was the map... so we would need to increase the size of many of the tiles slightly - but, underneath that, the map would be essentially the same as the original.

So, yeah, it was suddenly turning into a much bigger project.

---

## Converting and Updating The Map

The first thing we did was to export the original game's map. We'd need the map to be editable so I needed to export the map into file formats compatible with a suitable off-the-shelf map editor. LDtk seemed to be the ideal candidate for that - so I set to work on making some code for decoding the original game's data and to export into LDtk's format, as well as PNG and more.

Here's how the map looked from the original version of the game:-

![The full original C64 Sabre Wulf map: 16x16 screens of 256x176px jungle, exported from the game data](https://c64demo.com/img/-oQqHAZy4X-4096.png)

Once that was all done, it was relatively easy to get the map working in LDtk.. then, while I moved ahead with some other things, I was able to pass the LDtk file to Jon so that he could be working on getting his new tiles working - and for us to push the game to the 320px-wide that the C64 version really deserved. He was also able to fix the little "bug" present in the original game to do with entry/exit from certain screens - which I can show here:-

![Two vertically adjacent original screens where the path edges don't line up across the boundary, circled](https://c64demo.com/img/HZVPbxJIGq-256.png)

As you can imagine, if the player was walking on the right side of that path as he passed from the top screen to the bottom, without a small fix to his position, he'd be stuck in the shrubbery. The proper fix is of course to simply to make the path width consistent. I'm not totally sure why that wasn't done with the original game, instead of hacking the player's position, but I'm sure that there would've been "reasons" - and likely "good reasons"...

Here's how the new updated map is currently:-

![The full remastered map with Jon's new tiles: same 16x16 screen layout, each screen widened](https://c64demo.com/img/-85c9gMizE-4864.png)

Here's a side-by-side comparison of just a small portion of the map so that you can see the difference between old and new:-

![The same 3x3 block of screens side by side: original graphics left, remastered graphics right](https://c64demo.com/img/mCAyQ-wddc-1703.png)

---

## Optimising the Screen Update

I'd like to show a "small" snippet of the original's screen update code to show how we were able to optimise it as much as we have:-

```asm6502
	ldy #$00
Loop:
	lda ($59, x)
	sta ($53), y
	inc $59
	bne Not256
	inc $5a
Not256:
	iny
	cpy $03
	bne Loop
```

It's just really hard to know where to start when describing how bad this is in terms of CPU use ... LDA (ind,x) and STA(ind),y are the most expensive load and store instructions available on 6510... on top of that, for every single byte (of which there are over 5,500), there's overhead for updating the zeropage addresses and doing the looping... it's just bad, very very bad.

For comparison, here's my code (non-final - so may be optimised further before release):-

```asm6502
OuterLoop:
	ldy TileWidthMul8
	dey
CopyBitmapDataLoop:
	lda $abcd, y //; Self Modified Address
	sta $abcd, y //; Self Modified Address
	dey
	bpl CopyBitmapDataLoop
```

That's approx 14 cycles per byte compared to the original's 28. Double the speed - much more than that, actually, since the surrounding code is also much simpler. Even with a larger screen area (320px wide instead of 256px) and additional data to write for the extra colour data, we are still able to update the screen much faster when moving around the map. And we've done so without sacrificing memory, too.

---

### Coming Up...

I'm really just getting started with writing about Sabre Wulf Remastered. There's still quite a bit to cover to get to where the game currently is .. beyond that, though, I hope to use this blog to inspire myself to continue, to finally get the game finished. I owe it to Jon and others to finally do that. And, hell, I owe it to myself - despite nearly 30 years working in the video games industry, I have never actually coded a full game alone. My first game (Destruction Derby on PlayStation) needed 4 full time coders .. and every game that I've made since has needed incrementally more and more people. Sabre Wulf is something that, I hope, I can handle alone.

We'll see...

Until next time!
