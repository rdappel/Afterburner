---
title: "Pixel Shaders for Games — Part 3: Finding the Edge"
date: 2026-10-07
summary: "Build a sprite outline by sampling neighboring alpha values instead of looking only at the current texture coordinate."
tag: "Game dev"
readTime: 9
series: "Pixel Shaders for Games"
part: 3
draft: false
---

So far, each shader has only needed to look at the image pixel it is drawing. An outline needs one extra idea: inspect nearby pixels and use what they contain to decide what belongs at the current location.

We will use an image's alpha channel to find the edge of a sprite, then draw a colored border outside it without changing the original image.

## A pixel can ask its neighbors

An outline appears outside a sprite, where the current pixel is transparent. To decide whether to paint there, sample nearby texture coordinates and see whether any of them are opaque.

## Sampling alpha safely

Texture coordinates outside the 0-to-1 range need special handling. Returning zero makes outside-the-sprite samples transparent.

```glsl
float alphaAt(vec2 uv) {
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 0.0;
    return texture2D(u_texture, uv).a;
}
```

## Walking a small ring

The lab samples a circular neighborhood at several radii. `u_a` limits the active radius, allowing a one- to three-pixel outline without changing the shader source.

```glsl
float nearby = 0.0;
for (int radius = 1; radius <= 3; radius++) {
    for (int i = 0; i < 16; i++) {
        float angle = float(i) * 6.283185 / 16.0;
        vec2 offset = vec2(cos(angle), sin(angle)) * float(radius) / 32.0;
        if (float(radius) <= u_a) nearby = max(nearby, alphaAt(v_uv + offset));
    }
}
```

## Preserve the sprite, fill the empty edge

```glsl
vec4 pixel = texture2D(u_texture, v_uv);
gl_FragColor = pixel.a > 0.0 ? pixel : vec4(u_color, nearby);
```

<div data-shader-demo-slot="outline"></div>

Increase the outline width in the demo. The colored pixels appear where the sprite is transparent but an opaque neighbor was found. This is a useful reminder that the shader output need not match the original texture's visible footprint.

## Costs and limits

Every neighboring sample has a cost. Small outlines are inexpensive and predictable; larger soft glows usually call for a different technique, such as rendering an expanded sprite or using a blur pass.

## Up next

The next effect uses a second texture to decide which pixels remain at all.
