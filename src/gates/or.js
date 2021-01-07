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

const reflectors1 = new Group()
  .add(flipX(buckaroo()), 51, 53)
  .add(
   new Group()
     .add(rotate180(buckaroo())), 75, 30)

export const orGate = new Group()
  .add(makeGrid(true, true, true))
  .add(gliderGun(), 69, 82)
  .add(
   new Group()
     .add(flipX(rotate90(buckaroo()))).step(5), 96 + 20, 38 + 20)
  //.add(flipX(gliderEater()), 110, 71)
  .add(reflectors1, 0, 0)
  .add(rotate270(new Group().add(gliderGun()).step(2)), 134, 69)
