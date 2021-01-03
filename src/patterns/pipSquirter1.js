import {
  Engine
} from '../engine'

const source = `
#N Pipsquirter 1
#O Noam Elkies
#C A period 6 pipsquirter oscillator found in November 1997.
#C www.conwaylife.com/wiki/index.php?title=Pipsquirter_1
x = 15, y = 11, rule = B3/S23
3b2ob2o7b$b3obob3o5b$o4bo4bo4b$ob2o2b2obobo3b$bo2b2o3bobo3b$2b2o2b2obo
bob2o$4bo4bobob2o$4b4ob2o4b$8bo6b$6bobo6b$6b2o!
`

export const pipSquirter1 = () => Engine.parse(source)
