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
  Group
} from './patterns'

const GRID_SIZE = 200
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

const makeGrid = (inputs = 1) => {
  const _grid = new Group()
  _grid.add(block(), 0, GRID_SIZE / 2)
  _grid.add(block(), GRID_SIZE / 2, 0)
  _grid.add(block(), GRID_SIZE, GRID_SIZE / 2)
  _grid.add(block(), GRID_SIZE / 2, GRID_SIZE)

  _grid.add(makeGate(), GRID_SIZE / 4 - GATE_SIZE, GRID_SIZE / 4 - GATE_SIZE)

  _grid.add(makeGate(), (GRID_SIZE * 0.75) - GATE_SIZE * 3, (GRID_SIZE * 0.75) - GATE_SIZE * 3)

  if (inputs === 2) {
    _grid.add(flipX(makeGate()), GRID_SIZE * 0.75 - GATE_SIZE * 2.5, GRID_SIZE / 4 - GATE_SIZE * 0.5)
  }

  return _grid
}

const andGate = new Group()
andGate.add(makeGrid(2))
andGate.add(combine(
  translate(rotate270(gliderEater()), 0, 86),
  rotate270(gliderGun()),
  40,
  0
), 100, 80)

const emitter = translate(gliderGun(), 0, 13)

const minerva1 = new Group()
minerva1.add(emitter)
minerva1.add(andGate)

document.addEventListener('DOMContentLoaded', () => {
  const engine = new Engine()

  engine.load(minerva1, 'minerva1')

  engine.run()
}, false)
