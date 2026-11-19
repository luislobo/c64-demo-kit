# Seamless Loading in No Bounds

- URL: https://c64demo.com/seamless-loading-nobounds/
- Author: Raistlin (Genesis Project)
- Published: 2026-10-11
- Series: No Bounds
- Level: hard
- Tags: 6502, c64, loading, music, raster irqs
- Licence: CC BY 4.0 for text, CC BY 4.0 or MIT for code (https://creativecommons.org/licenses/by/4.0/)
- Releases: No Bounds by Genesis Project (2023) https://csdb.dk/release/?id=232957

> How No Bounds hides loading on the C64: background loading with Sparkle, transitions that cover the disk, clean IRQ handovers and music sync.

Assumes: IRQ loaders such as Sparkle; Raster IRQs; Stopping music popping (https://c64demo.com/stopping-music-popping/)

## Summary

I've written about a few of the effects in No Bounds already ([Finite Bobs](/finite-bobs-nobounds/), [Scrolling Bob Scroller](/scrolling-bob-scroller/), [Stopping Music Popping](/stopping-music-popping/)). This post is about something you hopefully *didn't* notice when watching it: the loading.

Unlike almost every C64 demo before it, No Bounds has no loading screens. Other demos would frequently sit on a static picture, an "and coming next is..." text screen or a plain black screen for 5-20 seconds while the drive ground away. We went to town to keep that to a minimum. Most part changes in No Bounds have no blank screen at all, and the worst are around a second.

Here's the demo, if you haven't seen it:-
Video: <https://www.youtube.com/watch?v=VEwcyjrxJX8>
*Video: [No Bounds by Genesis Project](https://www.youtube.com/watch?v=VEwcyjrxJX8), the full demo. Watch the part changes: the disk is busy behind almost all of them.*

---

## The Problem

Most demos, old and new, hide loading behind something:-

- a black screen;
- a static bitmap;
- a short text screen.

Our own Memento Mori was guilty of this. We had static bitmaps, with zero animation, held on screen for quite some time while the next part loaded. It was that, really, that made us think about doing better.

Other demos use the text trick. Rivalry, for example, puts up a simple "Hey, Censor! We beat your effect!" message while it loads in the background. It's fun - but it's still a loading screen.

There was another reason, too. We wanted to show PC demo-makers that, yeah, the C64 really can do a non-stop demo - and not just as a one-filer with simple effects.

So the difference looks something like this:-

![Timeline comparison of a typical demo vs No Bounds](https://c64demo.com/img/8EQeZxucUU-2420.png)

- In a typical demo the disk only spins when the screen is doing nothing.
- In No Bounds the disk is almost always spinning, and the screen is almost never doing nothing.

---

## RotatingGP to No Bounds

This is the one I'm proudest of. When we showed the demo at X 2023, people in the hall were audibly shocked at how the parts just kept hitting them - you can actually hear Bob (Censor) gasping on the recording :')

It's really three transitions back to back, all hanging off a single raster line in the middle of the screen.

### Into the Genesis Project logo

- the intro text closes down to nothing;
- a single white raster line appears;
- the RotatingGP rasters open out from that line, top and bottom;
- the logo rotates in, already moving, as the rasters reach full height.

![Fading into the RotatingGP part](https://c64demo.com/img/KG8GWLnuAn-1548.png)
*Into RotatingGP (left to right, top to bottom)*

### Out to "Presents"

- the rasters behind the logo drop away, a few lines at a time;
- the logo goes with them, leaving the white line;
- "Presents" bounces in letter by letter over the top.

![Fading out of RotatingGP into Presents](https://c64demo.com/img/zsybQAtH5E-1548.png)
*RotatingGP out to Presents (left to right, top to bottom)*

### Into No Bounds

- the "Presents" letters bounce away;
- a single raster line is all that's left;
- a raster fade bursts out from that line until it fills the screen;
- the No Bounds logo streams in from the right, over the same rasters.

![Presents to the No Bounds logo](https://c64demo.com/img/oMUUIQyfha-1548.png)
*Presents to No Bounds (left to right, top to bottom)*

There's no gap anywhere in there. And behind all of it, the disk is busy:-

- while RotatingGP runs, we preload the No Bounds logo bitmap;
- once the raster fade starts, we load the No Bounds code and the first 4 chunks of streaming data;
- the No Bounds part takes over and streams the rest of its bitmap from disk while it scrolls;
- its last streaming call preloads the raster fade that takes us out of the part.

### The Raster Fade

The fade into No Bounds is pure data. Facet drew it as an image where each column is one frame and each row is one rasterline. Here it is playing back, with the screen on the left and Facet's image on the right - the white box shows which column is on screen:-

![The raster fade playing back alongside Facet's raster image](https://c64demo.com/img/21b2vgQ8ya-1358.webp)

A C++ tool turns that image into a list of changes per frame - only the rasterlines that change colour get stored. That keeps the data small and quick to load, and the IRQ that plays it is tiny. Which matters, because the less code the transition needs, the more memory is free for the next part to load into. The fade plays out on the IRQ while the main thread just loads.

---

## Use Every Cycle

Wherever it was safe to, we'd start loading data for the next part while the current part was still playing.

Many of our parts were record-breakers, so they were pushed as close to 100% CPU as we dared. That doesn't matter. Sparkle loads from the main thread, outside of the IRQs, so it just soaks up whatever is left over. Even if we had less than 1% of a frame spare, we used it.

The No Bounds part takes this furthest. Its bitmap is 20 strips of 2000 bytes each - far too big to have in memory all at once - so it streams them from disk into 4 buffers as the screen scrolls:-

![Stream buffer usage across the loader calls](https://c64demo.com/img/q0LBfjdQGZ-2420.png)

The IRQ sets a flag when a buffer has been used up, and the main loop loads the next strip:-

```asm6502
	LoopForever:
		lda PartDone				//; Wait for part to finish
		bne FinishedThisPart
		lda $0400
		beq LoopForever
		jsr IRQLoader_LoadNext		//; The last loader call in this loop preloads FadeFromNoBounds.prg and RasterData
		dec $0400
		jmp LoopForever
```

---

## Fades Are Loading Time

Fade-outs and fade-ins are free loading time. The screen is busy, but the CPU mostly isn't.

Coming out of No Bounds, for example:-

- the fade code was preloaded by the No Bounds part's last streaming call;
- the logo scrolls off, leaving just the background rasters;
- those rasters fold away and Trailblazer's sky rasters fold in to replace them;
- Trailblazer's code and checkerboard data load during all of that;
- the borders close in and the checkerboard drops in.

![No Bounds to Trailblazer transition](https://c64demo.com/img/YDL1hVhtAP-1160.png)
*No Bounds to Trailblazer (left to right, top to bottom)*

And as soon as Trailblazer is running, we start preloading PlasmaVector.

Some of our raster fades deliberately "close in" towards a single raster line, as this one does. As they close in, we don't just fill the colour buffer with black (0) and keep running the same IRQ. We move the start and end of the raster IRQ in with it - so, as the fade gets smaller, the IRQ gets shorter, and more of each frame is freed up for loading the next part's data.

---

## Show Something While the Code Arrives

Sometimes a part needs more than we could preload. In those cases we'd start the new part with an image, or a simple effect, and load the real code behind it.

PlasmaVector is a good example:-

- Trailblazer's checkerboard squashes away;
- Razorback's face picture fades in, handled by a small intro routine;
- the plasma code loads while the face is on screen;
- then the plasma spreads out around it.

![PlasmaVector: picture first, plasma once the code has loaded](https://c64demo.com/img/9ieD2YGIIF-1160.png)
*Trailblazer to PlasmaVector (left to right, top to bottom)*

The disk script for this is about as simple as it gets:-

```asm6502
		jsr Intro_Go

		jsr IRQLoader_LoadNext

		jsr PlasmaVector_Go
```

---

## Clean Handovers

A lot of demos drop into a generic "loader IRQ" between parts - usually just playing the music over a blank screen. We tried hard to avoid that, or at least keep it short.

The trick is to make the old part's transition code very small, and to keep it somewhere the next part doesn't need:-

- once the transition starts, we assume all the old part's code is gone;
- the next part can load straight over it;
- the transition IRQ keeps playing the music and running the fade;
- when the new part is ready, it takes over the IRQ directly.

Care is needed here, of course - we need to be sure it's safe to switch IRQs at that moment.

Each part also comes with a tiny "DISK" file that loads at the same address every time and drives the loading for that part. When a part finishes, its DISK file pushes its own entry point onto the stack and jumps to the loader. The loader brings in the next part's DISK file over the top of it - and then "returns" straight into the new one:-

```asm6502
		lda #>(Entry-1)
		pha
		lda #<(Entry-1)
		pha
		jmp IRQLoader_LoadNext		//; Load next part, loader returns to address of Entry after job finished
```

---

## Loading Faster

All of this needs loading to be fast. Fast enough that the next part arrives before the transition runs out. A lot of this came down to working with **Sparta**, who's a genius with IRQ loading (his loader, Sparkle, is the best there is) and with compression.

Things we did:-

- **Sparkle**: we analysed which parts needed to load faster and tuned the disk layout and interleave for them;
- **bundles**: we ordered files so that each loader call brings in exactly what's needed next;
- **DALI compression**: to keep the data small;
- **compressible data**: we made sure the data itself was in a form that compresses nicely.

That last one is important. As I mentioned in my [Side Border Bitmap Scroller](/side-border-bitmap-scroller/) post, a little reordering of data can make a huge difference to the compressed size - without changing what you see on screen at all.

We did the same with unrolled code. Generated code is very repetitive - the same `LDA`/`ORA`/`STA $d020` instructions over and over - but the addresses and values in between change all the time. Mixed together, they don't compress well. So we'd split them into two chunks:-

- the repetitive part (the opcodes);
- the variant part (data and data addresses).

Each chunk compresses far better on its own.

---

## Keeping the Music Smooth

With parts and transitions handing over all the time, keeping the music play calls evenly spaced was hard. I covered this in [Stopping Music Popping](/stopping-music-popping/), so I won't repeat it here. These are the graphs we ended up with for No Bounds - very few spikes:-

![No Bounds side A music play timing](https://c64demo.com/img/KekoGIErg6-1572.png)

![No Bounds side B music play timing](https://c64demo.com/img/CO8mihm-w6-1572.png)

---

## Syncing to the Music

Psych858o changed the feel of the music for almost every part, to match what was on screen. So we wanted parts to start at exactly the right point in the music - and objects to appear exactly on a beat.

To do this, the music play routine also increments a 16-bit frame counter:-

```asm6502
BASE_PLayMusic:

		inc MUSIC_FrameLo
		bne !+
		inc MUSIC_FrameHi
	BASE_MusicPlayJmp:
!:		jmp MUSIC_BASE + $03
```

And parts wait for a hard-coded frame before starting:-

```asm6502
	.macro MusicSync(SyncFrame)
	{
	!:	lda $d011					//; Only check on raster lines 255+ to avoid IRQ where frame counter gets incremented
		bpl !-
		lda MUSIC_FrameLo
		cmp #<SyncFrame
		lda MUSIC_FrameHi
		sbc #>SyncFrame				//; C=0 - we haven't reached the sync frame yet, C=1 we have reached the sync frame
		bcc !-
	}
```

Here are the sync points for disk side 2. The frame counter restarts with the side 2 music, so the times are from the start of that side:-

| Frame | Time | What happens |
|---:|:---:|:---|
| 1,753 | 0:34 | Twist scroller starts |
| 3,457 | 1:08 | Chess game starts |
| 4,484 | 1:29 | Plot cube starts |
| 5,953 | 1:58 | TechTech head appears |
| 6,721 | 2:14 | TechTech head starts to wave |
| 7,487 | 2:29 | Wavy checkerboard finishes its wipe in |
| 8,449 | 2:48 | Bobs part text comes in |
| 8,797 | 2:55 | Bobs part bitmap wipes in |
| 9,985 | 3:19 | Earth part starts |
| 10,753 | 3:34 | TARDIS starts to fade in |
| 13,057 | 4:20 | Vertical bitmap scroller starts |

The catch is that loading from disk on a real C64 doesn't take exactly the same time on every machine. Drives vary. Disks vary too - and many of the 5.25" disks out there now are *really* old :') So:-

- we tested on real hardware, with a variety of disk drives and disks;
- we found when each part had finished loading;
- then we left a safe margin before its sync frame.

For example, loading of the next part might be finished by frame 15,000. Technically, we could start the part right there - but, to be safe, we might make the transition finish on frame 15,100, 2 seconds later. Faster drives and fresher disks just wait a little longer, and everyone sees the part start on the same beat.

<div class="message-box">

**A note for other demo makers:** ALWAYS test on real hardware, with real disks. The Ultimate II+ gives you perfect load times - if you rely on that, you're in for a shock on a real drive with real disk media.

</div>

---

## Wrapping Up

None of these tricks are new on their own. The difference with No Bounds is that we did all of them, everywhere, for the whole demo. It was a lot of work - and a lot of testing on real hardware - but I think the result speaks for itself. And Bob's gasp made it all worth it ;-)

We've seen a number of demos follow our example since, which is really good to see. We'd love to see the end of long, awkward pauses in C64 demos :-)

Huge thanks to **Sparta** for all of his help with the loading and compression side of things - without him, none of this would have been possible.

Until next time!
