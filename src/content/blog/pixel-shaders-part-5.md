---
title: "Pixel Shaders for Games — Part 5: Light, Distance, and Distortion"
date: 2026-10-17
summary: "Use UV coordinates as a tiny coordinate system for radial 2D lighting and animated water distortion."
tag: "Game dev"
readTime: 10
series: "Pixel Shaders for Games"
part: 5
draft: false
---

Texture coordinates do more than point at a color in an image. They also give every pixel a small two-dimensional location, which means we can measure distance, draw fields of light, and shift where the image is sampled.

This final article uses that idea twice: first for a movable 2D light, then for a simple animated water ripple.

## UV coordinates are positions

We have used `v_uv` as an address into a texture. It is also a two-dimensional coordinate system, which means it can describe distance from a light, waves across water, or any other field over a sprite.

## Distance creates the light

For each pixel, we can measure the straight-line distance from that pixel's UV coordinate to the light's UV coordinate. Pixels near the light should be bright; pixels farther away should gradually return to the scene's ambient brightness.

```glsl
float distanceToLight = length(v_uv - u_light);
```

`length` is the same distance calculation you would use for two points on a 2D map. The shader performs it once per pixel, which turns one light position into a smooth circular field of brightness.

## A radial 2D light

Measure the distance from the current fragment to a light position, then fade the light to zero over a chosen radius.

```glsl
vec4 pixel = texture2D(u_texture, v_uv);
float distanceToLight = length(v_uv - u_light);
float light = 1.0 - smoothstep(0.0, u_a, distanceToLight);
vec3 color = pixel.rgb * (vec3(u_b) + u_color * light);
gl_FragColor = vec4(color, pixel.a);
```

<div data-shader-demo-slot="light"></div>

Drag across the demo and change the radius. You are moving `u_light` and changing the range over which the distance value fades. This is a radial color effect. It does not know about normals, occluders, or shadows, but it is enough for many 2D scenes and effects.

## Distortion changes where we sample

For water, leave the geometry alone and offset the UV coordinates before reading the texture.

```glsl
vec2 uv = v_uv;
uv.x += sin(v_uv.y * 35.0 + u_time * u_b) * u_a;
uv.y += cos(v_uv.x * 28.0 + u_time * u_b * 0.8) * u_a;
gl_FragColor = texture2D(u_texture, clamp(uv, 0.0, 1.0));
```

<div data-shader-demo-slot="water"></div>

Each output pixel now reads a slightly different source location. The resulting moving ripple is a sampling trick, not a simulation.

## A reusable mental model

The series used five tools repeatedly:

- sample a texture
- pass uniform values from the game
- blend colors
- compare or reshape numeric values
- change the coordinate used for sampling

Those tools are enough to build a surprising number of readable, game-feel-focused effects.
