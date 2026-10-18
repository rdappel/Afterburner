---
title: "Pixel Shaders for Games — Part 2: Making a Sprite Pulse"
date: 2026-10-06
summary: "Turn a one-shot color flash into a repeating effect by passing time to the fragment shader and remapping a sine wave."
tag: "Game dev"
readTime: 7
series: "Pixel Shaders for Games"
part: 2
draft: false
---

Part 1 used a value from the game to control a one-shot flash. That works for damage, but a warning light, power-up, or collectible often needs to change on its own while it is visible.

In this article, we will pass time into the shader and use a sine wave to make the same color blend pulse at a controllable speed.

## Time is just another uniform

The previous shader needed the CPU to provide every blend value. That is right for a hit flash, but a warning glow or power-up aura can generate its own rhythm when the engine passes elapsed time as `u_time`.

## A sine wave is useful motion

`sin` oscillates from -1 to 1. Remap it into the 0-to-1 interval before using it as a mix amount.

```glsl
float pulse = 0.5 + 0.5 * sin(u_time * speed * 6.283185);
```

Multiplying by `2π` means `speed` is expressed in cycles per second instead of radians per second. That makes artist-facing controls easier to explain.

## Applying an intensity ceiling

A full red-white pulse is rarely what a game needs. Multiply the waveform by a separate peak-intensity value.

```glsl
void main() {
    vec4 pixel = texture2D(u_texture, v_uv);
    float pulse = 0.5 + 0.5 * sin(u_time * u_a * 6.283185);
    vec3 color = mix(pixel.rgb, u_color, pulse * u_b);
    gl_FragColor = vec4(color, pixel.a);
}
```

<div data-shader-demo-slot="pulse"></div>

Try changing the pulse speed, then pause the animation. The current frame is still just the same `mix()` from Part 1; the sine wave is simply changing its amount for us over time.

## Timing belongs outside the shader

The engine increments time, pauses it, and chooses whether an object should receive the effect. The shader turns that numeric input into a color. That division also makes deterministic screenshots and pause menus straightforward.

## Up next

So far every output pixel only reads itself. An outline needs to inspect the pixels around it.
