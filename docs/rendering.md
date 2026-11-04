# Rendering

Flat style, no outline: a rounded rectangle on 4 legs, 3/4 view facing right (+x), feet on y = 0, y down, units of `u`.

## Layers (`render/layers.ts`, `render/face.ts`)

Painter order: far legs (shaded) → ears → tail → head bump → body → belly → stripe → highlight → face (muzzle, blush, eyes, nose, mouth, whiskers, prop) → near legs.

`Appearance` = palette (`fur belly line paws inner blush eyes nose`) + shape (`roundness chubby legLength headBump stripe bellyStyle bellyWidth`) + face (`face earSize eyeSize cheekSize whiskers`).

- `SHAPES` presets: `soft` (default, mix of loaf and block, belly ellipse), `loaf` (rounder, belly band), `head` (head bump), `stripe` (dorsal stripe), `block` (square, no belly).
- `bellyStyle`: `patch` (centered ellipse clipped by the body, `bellyWidth` = its x radius), `band`, `none`.
- `face`: `mochi` (default: oval glossy eyes, small muzzle), `classic` (big muzzle), `pouch` (cheek pouch clipped by the body). Geometry per style in `FACES` (`face.ts`).

## Pose (`render/pose.ts`)

One flat object; [animations](animations.md) return partial poses.

- Body: `bx by` offset, `rot` around `piv` (−1 rear, 1 front, on the belly line), `sx sy` squash from the belly line, `lean` skew.
- Legs: foot offsets `fbx fby ffx ffy nbx nby nfx nfy` (far/near, back/front). Feet are planted on the ground unless `float` (follow the body), `grip` (front paws stay planted), `arm` (front paws held in front of the chest). `feet` overrides absolute positions (ragdoll).
- `back`: lying on its back (body flipped, legs up, face kept upright).
- Face: `fx fy tilt`, `upright` (counter-rotates body `rot`), `eye` style + `eyeOpen lookX lookY`, `mouth` style + `mouthOpen`, `cheek` puff, `blush`, `earF earN earDown`, `tail`, `phase`, `prop`.

## Strips (`render/strips.ts`)

Each animation is baked lazily into one horizontal image strip (`fw × frames`) at the current `u` and DPR. `SpriteBank` is an LRU with a pixel budget (12 M px); locomotion strips are pinned and prewarmed on idle. Appearance/size changes clear it.

## View (`render/View.ts`)

A fixed layer (`data-pet-ignore`) holding the shadow, a wrapper moved with `translate3d`, the canvas (`CANVAS` box in `u`) and an invisible hitbox. `drawStrip` blits one frame; `drawPose` draws a blended pose during [transitions](animations.md#transitions); `drawLive` draws the [ragdoll](physics.md) through `render/ragdoll.ts`, which picks the drawing frame so the face stays upright and switches to `back` from the legs' side.

Facing turns are a CSS rotation fake: an angle goes 0 → π in `motion.turnTime` (0.18 s), the canvas gets `scaleX(cos)` (never thinner than 0.14) plus a small hop. It snaps when leaving the ragdoll.

## FX

`fx/Fx.ts` spawns small SVG/DOM particles animated with WAAPI (transform/opacity only). `fx/Bubble.ts` is the speech bubble, `fx/Seed.ts` the falling seed.
