import { ANIMS, type AnimName } from './anims'

export class AnimPlayer {
  name: AnimName = 'idle'
  t = 0
  frame = 0
  done = false
  loops = 0
  speed = 1

  play(name: AnimName, restart = false, speed = 1) {
    this.speed = speed
    if (name === this.name && !restart) return
    this.name = name
    this.t = 0
    this.frame = 0
    this.done = false
    this.loops = 0
  }

  get progress() {
    const def = ANIMS[this.name]
    return Math.min(1, (this.t * def.fps) / def.frames)
  }

  update(dt: number) {
    const def = ANIMS[this.name]
    this.t += dt * this.speed
    const f = Math.floor(this.t * def.fps)
    if (def.loop) {
      this.loops = Math.floor(f / def.frames)
      this.frame = f % def.frames
    } else {
      this.frame = Math.min(f, def.frames - 1)
      this.done = f >= def.frames
    }
  }
}
