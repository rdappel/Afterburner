---
title: "Spatial Partitioning in a Shmup — Part 1: The Broad Phase"
date: 2026-04-13T10:40:31Z
summary: "Why naive collision detection struggles in shmups, and how a grid-based broad phase removes most unnecessary checks."
tag: "Game dev"
readTime: 10
series: "Spatial Partitioning in a Shmup"
part: 1
diagram: true
---

<!--
  PLACEHOLDER BODY — this is a condensed outline written for the redesign mock-up.
  Paste the original markdown of this post from your current Astro site over everything
  below the front matter. Headings (##) automatically become the numbered table of contents.
-->

[Article intro — paste the post’s opening paragraph here.]

## What is a shmup?

Shoot ’em ups put dozens — often hundreds — of moving objects on screen at once, and every one of them needs collision checks every frame. That makes them a perfect case study for optimization.

## Where things start to break

A naive approach is fine with a handful of objects. Add bullet patterns, enemies and effects, and the same approach becomes wasteful fast.

## The problem (and why it’s wasteful)

Checking every object against every other object scales quadratically — and most of those pairs could never touch.

```cpp
for (size_t i = 0; i < objects.size(); ++i)
    for (size_t j = i + 1; j < objects.size(); ++j)
        CheckCollision(objects[i], objects[j]); // O(n²)
```

## Broad phase vs narrow phase

Collision detection has two stages: the broad phase finds candidate pairs, and the narrow phase runs the actual intersection tests. This article covers the broad phase.

## What the broad phase should do

> Fewer collision tests — not faster ones.

The broad phase is a filter: its only job is to throw away pairs that can’t possibly collide.

## A simple broad phase: a grid

A uniform grid of fixed-size sectors suits a shmup well. Objects are only considered for collision with others in the same sector.

## How this fits into a real system

The level owns the sector grid and rebuilds it every frame: clear the sectors, update each object, let it register itself, and the grid reflects where everything is now.

## Building the grid

The grid is set up once, with sector dimensions derived from the screen size, then cleared and refilled each frame.

## Assigning objects to sectors

Objects have size, so one can overlap several sectors. Insert it into every sector its bounding box touches, or collisions on sector edges get missed.

```cpp
int x0 = std::clamp(int(box.left   / SECTOR), 0, cols - 1);
int x1 = std::clamp(int(box.right  / SECTOR), 0, cols - 1);
int y0 = std::clamp(int(box.top    / SECTOR), 0, rows - 1);
int y1 = std::clamp(int(box.bottom / SECTOR), 0, rows - 1);

for (int y = y0; y <= y1; ++y)
    for (int x = x0; x <= x1; ++x)
        m_pSectors[y * cols + x].push_back(pObject);
```

## Choosing a sector size

Match sector size to typical object size. Too large and you’re back to brute force; too small and objects get duplicated across many cells.

## What this doesn’t do

No collisions are actually tested yet. The broad phase just hands the next stage a much shorter list of candidates.

## Next: the narrow phase

Next up: deciding whether those candidate pairs really intersect.
