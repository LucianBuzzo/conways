import {
  Engine
} from './engine'
import {
  combinePatterns,
  flipX,
  gliderGun
} from './patterns'

const minerva1 = combinePatterns(
  gliderGun(),
  flipX(gliderGun()),
  43,
  1
)

document.addEventListener('DOMContentLoaded', () => {
  const engine = new Engine()

  engine.load(minerva1, 'minerva1')

  engine.run()
}, false)
