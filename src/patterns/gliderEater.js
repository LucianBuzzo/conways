import {
  Engine
} from '../engine'

const source = `
#N Eater 1
#O Bill Gosper
#C The first discovered eater and a 7-cell still life.
#C http://www.conwaylife.com/wiki/index.php?title=Eater_1
x = 4, y = 4, rule = B3/S23
2o2b$obob$2bob$2b2o!
`

export const gliderEater = () => Engine.parse(source)