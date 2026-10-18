---
title: "Pixel Shaders for Games — Part 1: A Pixel at a Time"
date: 2026-10-03
summary: "Start with the smallest useful fragment shader: sample a sprite, mix in a damage color, and leave alpha alone."
tag: "Game dev"
readTime: 7
series: "Pixel Shaders for Games"
part: 1
draft: false
---

A lot of game effects that look polished are just small changes to an image at draw time. A damage flash is a good first shader because you can see the result immediately, and its code introduces the same texture, color, and control-value ideas used by larger effects.

By the end of this article, you will know what a fragment shader receives, how it reads an image pixel, and how `mix()` turns one image color into another.

## What a fragment shader gets to decide

A shader is a tiny program that runs on the graphics card. A fragment shader gets one job: decide the final color of one pixel before it reaches the screen.

That sounds abstract, so this first effect stays small. We will read one pixel from an image, blend it toward red, and keep its transparent background transparent.

This series uses GLSL examples from a small WebGL lab, but the same building blocks show up in OpenGL, Unity, Godot, MonoGame, and most engines with materials.

## The three inputs we need

The first effect needs three pieces of information from the game:

- `u_texture`: the image we want to draw
- `u_color`: the red flash color
- `u_a`: how strong the flash is, from `0.0` (off) to `1.0` (all red)

The graphics system also gives each pixel `v_uv`, a pair of numbers that says where to look in the image. Think of `(0.0, 0.0)` as the top-left corner and `(1.0, 1.0)` as the bottom-right corner.

```glsl
precision mediump float;

uniform sampler2D u_texture;
uniform float u_a;
uniform vec3 u_color;

varying vec2 v_uv;
```

## Reading the sprite

`texture2D` looks up the color at `v_uv`. It returns four values: red, green, blue, and alpha. Alpha controls transparency.

```glsl
vec4 pixel = texture2D(u_texture, v_uv);
```

## Mixing in damage

`mix(a, b, amount)` blends between two values. With an amount of zero, we keep the original sprite. With an amount of one, we get the effect color. Values in between produce a smooth fade.

```glsl
void main() {
    vec4 pixel = texture2D(u_texture, v_uv);
    vec3 color = mix(pixel.rgb, u_color, u_a);
    gl_FragColor = vec4(color, pixel.a);
}
```

<div data-shader-demo-slot="flash"></div>

Try the slider now. At `0%`, the shader keeps the original sprite color. At `100%`, every visible sprite pixel becomes the effect color. The values in between are the smooth transition that makes a hit flash feel immediate instead of abrupt.

## Where the mix amount comes from

The game code decides when an enemy takes damage and changes `u_a` over time. The shader does not need to know why the number changed; it only turns the number into pixels. That separation is useful because the same shader can work for a hit flash, a pickup glow, or a brief invulnerability effect.

## Up next

One value is enough for a flash. The next part gives that value a clock so the effect can pulse on its own.
