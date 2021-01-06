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
  makeGrid
} from '../patterns'

export const andGate = new Group()
  .add(makeGrid(true, true, true))
  .add(new Group().add(flipX(rotate90(buckaroo()))).step(), 100, 74)
  .add(new Group().add(rotate270(gliderGun())).step(), 150, 72)
  .add(rotate270(gliderEater()), 103, 137)
