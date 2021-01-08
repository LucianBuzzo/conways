import {
  combine,
  flipX,
  flipXY,
  flipY,
  gliderEater,
  gliderGun,
  rotate90,
  rotate180,
  rotate270,
  translate,
  Group,
  buckaroo,
  makeGrid,
  GRID_SIZE,
  corner
} from '../patterns'
import {
  notGate
} from './not'
import {
  andGate
} from './and'

// TODO: condense this machinery into a smaller size. Currently it is a 5 grid
// gate, and it really needs to be in a single grid
export const orGate = new Group()
  .add(notGate,  GRID_SIZE / 2, 0)
  .add(notGate, 0, GRID_SIZE / 2)
  .add(corner,  GRID_SIZE, GRID_SIZE * 0.5)
  .add(andGate,  GRID_SIZE * 0.5, GRID_SIZE)
  .add(notGate, GRID_SIZE, GRID_SIZE * 1.5)

