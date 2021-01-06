import {
  Engine
} from './engine'
import {
  combine,
  flipX,
  flipY,
  gliderEater,
  gliderGun,
  rotate90,
  rotate180,
  rotate270,
  translate,
  block,
  Group,
  pipSquirter1,
  buckaroo,
  snark,
  makeGrid,
  GATE_SIZE,
  GRID_SIZE
} from './patterns'

import {
  orGate
} from './gates/or'
import {
  andGate
} from './gates/and'
import {
  notGate
} from './gates/not'

/**
 * NOTES
 * - Gliders take 4 steps to move 1 cell diagonally
 * - Guns and Buckaroos take 30 steps to cycle
 * - A buckaroo is able to bounce a glider every 15 squares diagonally
 * - Grids needs to be in multiples of 15??
 */

const glider90turn = new Group()
  .add(translate(gliderGun(), 0, 13))
  .add(rotate90(buckaroo()), 37, 33)

const emitterGrid = new Group()
  .add(makeGrid(false, false, true))
  .add(translate(gliderGun(), 69, 82))

const corner = new Group()
  .add(makeGrid(true, false, false, true))
  .add(rotate90(buckaroo()), 91, 87)

const t = new Group()
  .add(emitterGrid, 0, GRID_SIZE / 2)
  .add(emitterGrid, GRID_SIZE / 2, 0)
  .add(corner, GRID_SIZE, GRID_SIZE / 2)
  .add(andGate, GRID_SIZE / 2, GRID_SIZE)
//  .add(corner, GRID_SIZE, GRID_SIZE * 1.5)

const t1 = new Group()
  .add(emitterGrid, 0, GRID_SIZE / 2)
  .add(emitterGrid, GRID_SIZE / 2, 0)
  .add(corner, GRID_SIZE, GRID_SIZE / 2)
  .add(orGate, GRID_SIZE / 2, GRID_SIZE)

document.addEventListener('DOMContentLoaded', () => {
  const engine = new Engine()

  setTimeout(() => {
    engine.init()

    engine.load(t1, 'minerva1')

    engine.setGeneration(628)
    // engine.run()
  }, 100)
}, false)
