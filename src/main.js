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
  snark
} from './patterns'

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

const GRID_SIZE = 180
const GATE_SIZE = 4

const makeGate = () => {
  const _gate = new Group()

  _gate.add(block(), GATE_SIZE * 2, 0)
  _gate.add(block(), 0, GATE_SIZE * 2)

  _gate.add(block(), GATE_SIZE * 3, GATE_SIZE)
  _gate.add(block(), GATE_SIZE, GATE_SIZE * 3)

  _gate.add(block(), GATE_SIZE * 4, GATE_SIZE * 2)
  _gate.add(block(), GATE_SIZE * 2, GATE_SIZE * 4)

  return _gate
}

const makeGrid = (gate1, gate2, gate3, gate4) => {
  const _grid = new Group()
  _grid.add(block(), 0, GRID_SIZE / 2)
  _grid.add(block(), GRID_SIZE / 2, 0)
  _grid.add(block(), GRID_SIZE, GRID_SIZE / 2)
  _grid.add(block(), GRID_SIZE / 2, GRID_SIZE)

  if (gate1) {
    _grid.add(makeGate(), GRID_SIZE / 4 - GATE_SIZE, GRID_SIZE / 4 - GATE_SIZE)
  }

  if (gate2) {
    _grid.add(flipX(makeGate()), GRID_SIZE * 0.75 - GATE_SIZE * 2.5, GRID_SIZE / 4 - GATE_SIZE * 0.5)
  }

  if (gate3) {
    _grid.add(makeGate(), (GRID_SIZE * 0.75) - GATE_SIZE * 3, (GRID_SIZE * 0.75) - GATE_SIZE * 3)
  }

  if (gate4) {
    _grid.add(flipX(makeGate()), GRID_SIZE * 0.25 - GATE_SIZE * 0.5, GRID_SIZE * 0.75 - GATE_SIZE * 2.5)
  }

  return _grid
}

const andGate = new Group()
  .add(makeGrid(true, true, true))
  .add(flipX(rotate90(buckaroo())), 91, 87)
/*
  .add(combine(
    translate(rotate270(gliderEater()), 0, 86),
    rotate270(gliderGun()),
    40,
    0
  ), 100, 80)
*/

const emitter1 = translate(gliderGun(), 0, 13)
const emitter2 = translate(gliderGun(), 0, 13)

const emitterGrid = new Group()
  .add(makeGrid(false, false, true))
  .add(translate(gliderGun(), 69, 82))

const corner = new Group()
  .add(makeGrid(true, false, false, true))
  .add(rotate90(buckaroo()), 91, 87)

const t = new Group()
//  .add(emitterGrid, 0, GRID_SIZE / 2)
  .add(emitterGrid, GRID_SIZE / 2, 0)
  .add(corner, GRID_SIZE, GRID_SIZE / 2)
  .add(andGate, GRID_SIZE / 2, GRID_SIZE)

document.addEventListener('DOMContentLoaded', () => {
  const engine = new Engine()

  engine.load(t, 'minerva1')

  engine.run()
}, false)
