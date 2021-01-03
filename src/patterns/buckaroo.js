import {
  Engine
} from '../engine'

const source = `
#N Buckaroo
#O David Buckingham
#C A period 30 oscillator based on the queen bee shuttle.
#C The oscillator will still function if the eater is moved
#C   closer to the queen bee by one space, but it will lose
#C   its ability to reflect gliders.
#C www.conwaylife.com/wiki/index.php?title=Buckaroo
x = 23, y = 9, rule = B3/S23
9bo$7bobo$6bobo$2o3bo2bo$2o4bobo$7bobo9b2o$9bo9bobo$21bo$21b2o!
`

export const buckaroo = () => Engine.parse(source)
