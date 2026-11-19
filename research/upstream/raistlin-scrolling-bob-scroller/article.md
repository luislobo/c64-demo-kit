# Scrolling Bob Scroller

- URL: https://c64demo.com/scrolling-bob-scroller/
- Author: Raistlin (Genesis Project)
- Published: 2023-06-08
- Series: No Bounds
- Level: intermediate
- Tags: 6502, c64, bobs, scrollers
- Licence: CC BY 4.0 for text, CC BY 4.0 or MIT for code (https://creativecommons.org/licenses/by/4.0/)
- Releases: No Bounds by Genesis Project (2023) https://csdb.dk/release/?id=232957

> How the No Bounds bob scroller repeats on a diagonal: one shape plotted to a C64 charset, ten screens and $d018 doing the scrolling.

Assumes: DXYCP scrollers (https://c64demo.com/dxycp-scrollers/); Smooth scrolling with $d011 and $d016

## Summary

If you haven't already read the [blog post about DXYCP scrollers](/dxycp-scrollers/), I'd recommend reading that first. Here I will be explaining how I added the infinite/repeating scroll element seen in our **No Bounds** demo (released at X2023).

You can see the finished product in action here:-
Video: <https://www.youtube.com/watch?v=VEwcyjrxJX8&t=251>
*Video: [No Bounds by Genesis Project](https://www.youtube.com/watch?v=VEwcyjrxJX8&t=251), from 4:11: the bob scroller with its repeating diagonal scroll.*

---

## The Idea

I really didn't want to make another bob scroller, I promise .. because I've made quite a few of these before:-

- a 96 bob scroller in Delirious 10
- an improved 96 bob scroller in Delirious 11
- a 128 bob scroller in X Marks the Spot
- a 212 bob scroller in The Dive
- Memento Mori's larger, more interesting bob scroller..
- 232 chars in the shape of a Christmas tree for Christmas Megademo
- 140 bobs in Tree of Peace ("Sprites Only")

But anyway... one more couldn't hurt ;-) ... I just needed to find some new edge to it.. some way to make it a little more interesting.

I figured that there were two ways that this could be taken..

1. to strip the effect right back to basics and simply go for the ultimate world record
1. to try to push it in a new and more interesting direction.

For No Bounds, I did both. The idea for the new direction came from my own surprise at how this effect could still look great with lots of intersections of the bobs - the tree in Christmas Megademo had been very well received so I started to think about how I could improve on that.

It came to me that if the scroller was repeated on the screen, with certain displacements horizontally and vertically, it would actually be possible to manage. If the scrollers are spaced out by 80px in X and Y, as an example, there's then just a need to be able to scroll the screen by 0-79px (we in fact can scroll by much more - since the screen scrolled by 80px looks identical to how it did in the starting position).

---

## First Steps

I played around for a while with different shapes trying to find something that would work well... creating an interesting shape, easily repeatable, and which would have overlaps between displaced copies of itself - but not so many to make the text unreadable.

Here's what I came up with and what you'll see in the final demo:-

![The rounded-star bob path in red, with copies in green and blue displaced diagonally by 80px](https://c64demo.com/img/QlZ1MYq6xv-320.png)

This has a nice rounded-star bob pattern and copies of that are created displaced by 80px (10 chars) in both X and Y. Since the whole shape is being displaced by such, the combined image will repeat at the same distance. Here's an image that highlights how that works:-

![The repeated pattern split into diagonal bands, one per copy of the shape, each band tinted in its copy's colour](https://c64demo.com/img/0UfNOKoWcG-320.png)

And here's one of the segments isolated:-

![One diagonal segment on its own: the part of the path that actually has to be plotted](https://c64demo.com/img/TfhfzrPxye-320.png)

This shows nicely what is needed to actually be plotted. By repeating the shape on-screen, all that has really changed is that there are now some points where the overlap needs to be dealt with. That is, these points here:-

![The segment with two circled points where neighbouring copies of the path overlap](https://c64demo.com/img/CGGn1DEM8l-320.png)

It's pretty clear, then, that this isn't going to cost much extra CPU - the overlap points are quite negligible in this case.

There is, however, one small hurdle left to consider...

---

## What To Plot To..?

My previous bob scrollers were either plotting to sprites (allowing them to be easily moved around over bitmaps and such) or to bitmap.

To allow duplicate copies for low cost, definitely I couldn't use bitmap as an output target. There's simply no good way of doing it.

Sprites might be possible .. but it would add a restriction on the total size of each bob shape since you can, of course, only have 8 sprites on each horizontal line of the screen.

Instead, we can plot to a character set (hopefully some reading this will be screaming "well, duh!"..). So long as the repeating shape above can be plotted to 256 characters or less, all is good. And it -is- good - for that shape, only 144 characters are needed in total.

---

## The Final Steps

Plotting to that char-data is of course quite easy... that's already detailed in the DXYCP blog post that I linked to earlier.

We can create our screen of repeated shapes by simply writing the 144 char values to our screen data, repeating them at displacements of 10 chars in both X and Y. For the exact effect that I made, you'd need a couple of duplicates of the shape to the top-left and a couple to the bottom-right to make sure that the whole screen is covered.

To do the diagonal scrolling, we can simply create 10 40x25 char screens and displace the shapes for each.. screen 0 with no displacement, screen 1 with 1 char displacement in X and Y, screen 2 with 2 chars displacement, ... screen 9 with 9 chars displacement. This makes the scrolling super cheap - simply change $d018 to point to the appropriate screen (using *((sinevalue / 8) % 10)* to give the screen index) and set $d016 and $d011 to give your horizontal and vertical smooth-scroll.

---

## Wrapping Up

That's it! A surprisingly easy effect to create, if you've already mastered the art of bob scrollers, and I think it looks pretty cool.

Until next time!
