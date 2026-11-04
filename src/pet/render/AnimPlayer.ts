import { ANIMS, type AnimName } from './anims'
import { blendTime, framePose, mixPose } from './blend'
import { easeInOut, type Pose } from './pose'

export class AnimPlayer {
  name: AnimName = 'idle'
  t = 0
  frame = 0
  done = false
  loops = 0
  speed = 1
  blendScale = 1
  private from: Pose | null = null
  private bt = 0
  private bd = 0
  private cut = true

  play(name: AnimName, restart = false, speed = 1) {
    this.speed = speed
    if (name === this.name && !restart) return
    if (name !== this.name) this.blendTo(name)
    this.name = name
    this.t = 0
    this.frame = 0
    this.done = false
    this.loops = 0
  }

  snap() {
    this.from = null
    this.cut = true
  }

  get blending() {
    return this.from !== null
  }

  pose(): Pose {
    const cur = framePose(ANIMS[this.name], this.frame)
    return this.from ? mixPose(this.from, cur, easeInOut(Math.min(1, this.bt / this.bd))) : cur
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
    if (this.from && (this.bt += dt) >= this.bd) this.from = null
  }

  private blendTo(name: AnimName) {
    const from = this.cut || this.blendScale <= 0 ? null : this.pose()
    this.cut = false
    this.from = null
    if (!from) return
    const d = blendTime(ANIMS[this.name], ANIMS[name], from, framePose(ANIMS[name], 0)) * this.blendScale
    if (d <= 0) return
    this.from = from
    this.bt = 0
    this.bd = d
  }
}
