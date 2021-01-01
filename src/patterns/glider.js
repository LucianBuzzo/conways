import {
  Engine
} from '../engine'

const source = `
x = 3, y = 3
bo$2bo$3o!
`

export const glider = () => Engine.parse(source)
