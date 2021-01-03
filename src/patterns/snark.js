import {
  Engine
} from '../engine'

const source = `
#N Snark
#O Mike Playle
#C The fastest and smallest 90-degree stable glider reflector (as of
#C June 2013).
#C www.conwaylife.com/wiki/Snark
x = 17, y = 23, rule = B3/S23
6b2o3b2o$6b2o2bob3o$10bo4bo$6b4ob2o2bo$6bo2bobobob2o$9bobobobo$10b2obo
bo$14bo2$2o$bo7b2o$bobo5b2o$2b2o7$12b2o$3b2o7bo$2bobo8b3o$4bo10bo!
`

export const snark = () => Engine.parse(source)
