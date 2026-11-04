# Animations

`render/anims/*` define `AnimDef { frames, fps, loop, box?, pose(p, i) }`: `p` is progress (0..1, exclusive end when looping), `i` the frame index, `pose` returns a partial [pose](rendering.md#pose). `box` (in `u`) sizes the baked frame; default `{ w: 1.5, up: 1.05, down: 0.1 }`, it must fit in the View `CANVAS`.

Helpers in `anims/kit.ts`: `sitUp(t)` (rear up on hind legs, paws as arms, face upright), `steps` (diagonal gait), `paddle` (legs flailing), `blink(i, at)`, boxes `SIT_BOX`, `HOP_BOX`. Easing helpers live in `pose.ts`.

| file | anims |
| --- | --- |
| `locomotion.ts` (pinned) | idle walk run crouch jumpUp jumpDown fall land landHard climb hang |
| `idle.ts` | sit groom stretch yawn look sniff curious curiousDown sleep fallAsleep wake eat |
| `interact.ts` | happy purr roll squish unsquish startle dizzy dizzyBack getup getupBack |
| `reactions.ts` | the 12 reactions |

## Reactions

`approve cancel delete error success warning thinking love wave surprised confused sad`. Looping ones (`thinking love wave confused sad`) run `duration` seconds (2.6 default) or until replaced with `hold`. FX cues per reaction (check, cross, poof, sweat, confetti, hearts…) are timed in `brain/social.ts`.

## Adding one

1. Add the def to the right file (keep files under ~300 lines).
2. If it is a reaction, add its name to `REACTION_NAMES` (`types.ts`) and its cues to `CUES` (`brain/social.ts`).
3. Trigger it from a brain task with `once(c, name)` / `hold(c, name, s)` ([brain](brain.md)).
