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
  makeGrid
} from '../patterns'

const reflectors = new Group()
  .add(flipY(gliderGun()), 0, 54)
  .add(rotate180(buckaroo()), 26 + 30, 23 - 30)
  .step()
  // .add(
  //  new Group()
  //    .add(rotate90(buckaroo())).step(), 113, 64)

export const orGate = new Group()
  .add(makeGrid(true, true, true))
  .add(gliderGun(), 69, 82)
  .add(flipX(gliderEater()), 110, 71)
  .add(rotate180(flipY(reflectors)), 81, 10)
