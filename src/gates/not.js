import {
  flipX,
  gliderGun,
  rotate90,
  translate,
  Group,
  buckaroo,
  makeGrid
} from '../patterns'

export const notGate = new Group()
  .add(makeGrid(true, false, true))
  .add(translate(gliderGun(), 69, 82))
  .add(rotate90(buckaroo()), 61, 57)
  .add(new Group().add(flipX(rotate90(buckaroo()))).step(7), 34, 80)
  .add(new Group().add(flipX(buckaroo())).step(26), 78, 124)
