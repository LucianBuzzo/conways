import {
  Engine
} from '../engine'

const source = `
#N Block
#C An extremely common 4-cell still life.
#C www.conwaylife.com/wiki/index.php?title=Block
x = 2, y = 2, rule = B3/S23
2o$2o!
`

export const block = () => Engine.parse(source)
