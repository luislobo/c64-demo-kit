# Stopping Music Popping

- URL: https://c64demo.com/stopping-music-popping/
- Author: Raistlin (Genesis Project)
- Published: 2023-06-01
- Series: No Bounds
- Level: intermediate
- Tags: 6502, c64, music, sid, raster irqs, tools
- Licence: CC BY 4.0 for text, CC BY 4.0 or MIT for code (https://creativecommons.org/licenses/by/4.0/)
- Releases: No Bounds by Genesis Project (2023) https://csdb.dk/release/?id=232957; Memento Mori by Genesis Project (2020) https://csdb.dk/release/?id=195841

> Finding and fixing uneven music play calls in C64 demos, using VICE monitor traces to spot missed, doubled and drifting calls.

Assumes: Raster IRQs and the music init and play calls; The VICE monitor

## Summary

Music playback on C64 is one of the simplest things in the world to achieve ... usually just 2 calls to be made, MusicInit, done once, and MusicPlay, once per frame (though some music can be setup for different play rates).

Something as simple as the following can play most tunes (with init at $1000, play at $1003):

```asm6502
.var MusicInit = $1000
.var MusicPlay = $1003

  sei
  lda #$00
  jsr MusicInit
!w:
  lda #$ff
  cmp $d012
  bne !w-
  jsr MusicPlay
  jmp !w-
```

We're calling MusicPlay on the rasterline 255 every frame - with the time between each call being ~19,656 cycles (a PAL screen is made up of 312 raster lines, each being 63 cycles long, giving us 312 * 63 = 19,656).

In complex demos where the music crosses across several demo parts, and those demo parts have varied IRQ setups, we should be careful with these MusicPlay calls - to keep the music sounding smooth, we need to make sure that we're keeping the distance between calls as close to 19,656 cycles as possible.

One demo part might be doing graphical work in the top and bottom border area in order to prepare data ready for the next screen ... other parts might be doing graphical work across the whole screen area. So we can't always consistently call MusicPlay at the same point .. so how do we deal with that?

---

## Music Play Timing

It's common, particularly during initialisation of a new demo part, transition into a new part, or simply in the final switch (swapping IRQ vectors) to miss or duplicate a MusicPlay call. If you miss a call, that could mean you've left a gap of 19,000 cycles or more between calls. The opposite of that would be that you call MusicPlay twice where the gap between is much less than the holy grail of 19,656.

Many people can't tell that this has happened - but some of us can. And, to us, it can totally ruin the fluidity of a demo.

---

## Using 'VICE mon' to Detect Music Popping

The following lines, kindly given to me by Groepaz, are a Godsend.

```markup
logname "music.txt"
trace exec 1006
log on
```

Essentially, the first line is creating our log file, the next is setting a trace for all calls to $1006 and the third is simply turning on the logging.

We then run the demo for a while and then disable logging with:-

```markup
log off
```

The log file that's been generated will contain something like this - but likely much much longer (I mention the length because, even in 2023, Visual Studio Pro struggles with these long files ... so you might want to fire up Notepad+ or your editor of choice instead).

```markup
(C:$fd84) log off
(C:$fd84) x
#1 (Trace  exec 1006)  206/$0ce,  24/$18
.C:1006  A9 00       LDA #$00       - A:00 X:B1 Y:71 SP:ed ..-..I.C  123924426
#1 (Trace  exec 1006)  206/$0ce,  24/$18
.C:1006  A9 00       LDA #$00       - A:00 X:B1 Y:71 SP:ed ..-..I..  123944082
#1 (Trace  exec 1006)  206/$0ce,  24/$18
.C:1006  A9 00       LDA #$00       - A:00 X:B1 Y:71 SP:ed ..-..I.C  123963738
#1 (Trace  exec 1006)  206/$0ce,  24/$18
.C:1006  A9 00       LDA #$00       - A:00 X:B1 Y:71 SP:ed ..-..I..  123983394
#1 (Trace  exec 1006)  206/$0ce,  24/$18
.C:1006  A9 00       LDA #$00       - A:00 X:B1 Y:71 SP:ed ..-..I.C  124003050
#1 (Trace  exec 1006)  206/$0ce,  24/$18
.C:1006  A9 00       LDA #$00       - A:00 X:B1 Y:71 SP:ed ..-..I..  124022706
```

What we need to care about here are those numbers at the end ... 123924426, 123944082 etc. These are the CPU clock counts for the point where we hit the music play address - so we can use these to determine the spacing of each call. With a little bit of text-editing, we can pull these numbers into a spreadsheet and garner the information that we need... see the snippet below from our spreadsheet. Note that "CyclesTaken" is simply ClockTick minus the previous ClockTick:-

| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Frame&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ClockTick&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;CyclesTaken&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |
|:---:|:---:|:---:|
| ... | ... | ... |
| 1691 | 46093367 | 19655 |
| 1692 | 46113024 | 19657 |
| 1693 | 46132679 | 19655 |
| 1694 | 46152337 | 19658 |
| 1695 | 46187167 | **34830** |
| 1696 | 46206823 | 19656 |
| 1697 | 46226479 | 19656 |
| 1698 | 46246135 | 19656 |
| 1699 | 46265791 | 19656 |
| ... | ... | ... |
| 5398 | 118954566 | 19656 |
| 5399 | 118958163 | **3597** |
| 5400 | 118977819 | 19656 |
| ... | ... | ... |

Some observations about this:-

- the first 4 entries show "pretty good" timings. These are essentially calls coming from IRQs where we don't have jitter correction. This is 100% fine;
- the last 4 entries show "perfect" timings. These are bang on - but at the loss of some cycles to get stable raster timing. While I might help some people's OCD to know that these are perfect, there's zero point since the musicplay function itself won't be writing to SID quite so precisely ;-)
- the final and most important thing to note here is that 34,830 value. That one -could- definitely be heard, could cause problems and should almost definitely be fixed.

I made a graph showing the ranges that we were hitting on Memento Mori's 1st disk side. We didn't (sorry!) do any testing at the time to find out how our music calls were spaced - shame on us, really, as it does look like we dropped the ball a few times.

On the graphs, you can clearly see where we:-
- missed a PlayMusic call (the bar is close to "39312")
- called twice in short succession ("close to "0")
- changed the raster location of PlayMusic calls (the mid-height spikes above and below the baseline)
- had invariance (the sections where we're fuzzing above and below the baseline)
- were near to perfect (no bars showing far from baseline)

![Cycles between play calls, Memento Mori side A: several spikes, missed and double calls, a long fuzzy section](https://c64demo.com/img/bNPkSvUwIg-1572.png)

![Cycles between play calls, Memento Mori side B: tall spikes near 0 and 39312 where calls were doubled or missed](https://c64demo.com/img/CUBtGyTVF--1572.png)

![Cycles between play calls, Memento Mori side C: constant jitter around 19656 and one missed call](https://c64demo.com/img/s-Pgr4ekmP-1572.png)

For comparison, here're equivalent graphs from No Bounds, our latest demo that was released at X 2023 (2-4 June, 2023). With this demo, we made a concerted effort to try to remove any "spikes" to make sure that there was no popping. A huge improvement I hope you'll agree. That's evident in the demo, too - you're very unlikely to notice anything untoward in the music playing throughout.

![Cycles between play calls, No Bounds side A: almost flat on 19656, small spikes and one full-height spike](https://c64demo.com/img/KekoGIErg6-1572.png)

![Cycles between play calls, No Bounds side B: almost flat on 19656, one full-height spike and a few small ones](https://c64demo.com/img/CO8mihm-w6-1572.png)

---



## PlayMusic Variance

One problem that you should absolutely avoid when playing music is to make the call to PlayMusic at a highly variable point per frame. For example, don't put the call after blocks of code that can have variable timing. If you see CyclesTaken values coming through that are all over the place during an effect, that's a big warning sign that you're doing this.

```asm6502
MainIRQ:
//; ... push A/X/Y/$01

   jsr PlotCube         //; could take 3,000 cycles.. could take 5,000
   jsr DoScrolling      //; approx 500 cycles every 8 frames - otherwise close to 0
   jsr PlayMusic        //; <-- UNSTABLE music call

//; ... pop A/X/Y/$01
```

If you're doing it, stop. Either move PlayMusic to be the first issued call .. or create another IRQ for it. You need to get that timing stabilised or you'll hear strange hissing/warbling from the music.

```asm6502
MainIRQ:
//; ... push A/X/Y/$01

   jsr PlayMusic        //; <-- STABLE music call
   jsr PlotCube         //; could take 3,000 cycles.. could take 5,000
   jsr DoScrolling      //; approx 500 cycles every 8 frames - otherwise close to 0

//; ... pop A/X/Y/$01
```

---

## Fixing the Music Popping
	
So now that we have a trace and output to help isolate the frames where the popping is happening, we have a very good starting point. There are many ways to use VICE's monitor to help you track down the exact problem. You could just keep breaking into VICE and using the "r" command to tell you what the current clock cycle is - a simple trial and error of breaking in and figuring out what's happening in the demo around the area of the pop.

My process for this was:-

- set a breakpoint on PlayMusic calls:-

```markup
bk 1003
```

- set a watch on changes to $d012:-

```markup
w store d012
```

In most cases this was enough to pinpoint the exact problem. And usually an easy fix to make.

---

## Sliding Music Calls

Sometimes, it's not quite so easy to fix the popping.. sometimes, you'll get a CyclesTaken of ~30,000 (~1.5 frames) or ~10,000 (0.5 frames). With these, it's not a simple matter of adding an extra PlayMusic call .. or of removing one.

In these cases, what we can do is to use a few frames to "slide" the PlayMusic call. The half-frame variance is coming from that we're calling PlayMusic on different rasterlines in two different parts of the demo. So, for example, one part might have an IRQ at rasterline 255 where PlayMusic is called each frame. The next part might make the same call on rasterline 50. For the first frame of part two, our CyclesTaken is going to be off.

To fix this, we just need a bunch of frames where we'll slowly "slide" the PlayMusic call... if we slide over 11 frames, for example, we could call on rasterlines 255, 235, 214, 194, 173, 153, 132, 112, 91, 71, 50. Over these 11 frames, we would have CyclesTaken at ~18,600. The more frames you use for the slide the closer it's going to be to where it should be ... but it's a balance between smoothing the music and not interrupting the demo for too long, right?

---

## Wrapping Up

No need to go overboard with improving the timings of the music calls during transitions and so on .. come up with a threshold within which you'd like the MusicPlay calls to be and just aim for that .. I'd say that you should try to be as close as possible to 19,656 for most frames .. and perhaps aim for 5-10% variance from there, above or below, for transitions and part-changes. Speak to the musician, if you can, and ensure that they're happy with the result.
