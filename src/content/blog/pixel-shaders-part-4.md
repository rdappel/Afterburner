---
title: "Pixel Shaders for Games — Part 4: Dissolving with Noise"
date: 2026-10-16
summary: "Use a noise texture, a threshold, and a narrow color band to dissolve a sprite without making it disappear all at once."
tag: "Game dev"
readTime: 9
series: "Pixel Shaders for Games"
part: 4
draft: false
---

A dissolve is more interesting than a simple fade because different parts of the image disappear at different times. A noise image gives us a repeatable but irregular value for every pixel, which is enough to make that decision.

This article uses that noise to remove pixels, then adds a thin colored edge so the disappearing parts still read clearly during the effect.

## A second texture can be data

The dissolve effect samples the sprite as usual, then samples a grayscale noise texture at the same UV coordinate. The noise value does not need to be visible; it acts as a per-pixel decision.

## Thresholding the noise

As the dissolve amount rises, more noise values fall below the threshold and are discarded.

```glsl
vec4 pixel = texture2D(u_texture, v_uv);
float noise = texture2D(u_noise, v_uv).r;

if (u_a >= 1.0 || (u_a > 0.0 && noise < u_a)) discard;
```

`discard` means this fragment contributes nothing. It is powerful for cutouts, but it should be used deliberately because it can affect GPU optimizations and render ordering.

## Finding the active edge

The interesting part of a dissolve is the thin band just above the threshold. `smoothstep` turns that range into a controllable edge mask.

```glsl
float edge = 1.0 - smoothstep(u_a, u_a + u_b, noise);
vec3 color = mix(pixel.rgb, u_color, edge * step(0.0001, u_a));
gl_FragColor = vec4(color, pixel.a);
```

<div data-shader-demo-slot="dissolve"></div>

Move the dissolve control slowly. First, the noise removes pixels; then the thin group of pixels nearest the threshold receives the orange edge color. This is an emissive-looking color treatment, not bloom. Actual glow beyond the sprite would require an additional rendering step.

## Choosing noise that fits the effect

Fine-grained noise gives a dusty disintegration. Larger, softer patterns give a chunkier break-apart effect. The noise texture is an artistic control surface, not an implementation detail.

## Up next

The final part moves away from colors and thresholds to manipulate the texture coordinates themselves.
