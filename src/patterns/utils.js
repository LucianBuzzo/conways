export const combine = (p1, p2, xOffset = 0, yOffset = 0) => {
  const fieldX = new Int32Array(p1.field_x.length + p2.field_x.length)
  fieldX.set(p1.field_x)
  fieldX.set(p2.field_x.map(n => n + xOffset), p1.field_x.length)

  const fieldY = new Int32Array(p1.field_y.length + p2.field_y.length)
  fieldY.set(p1.field_y)
  fieldY.set(p2.field_y.map(n => n + yOffset), p1.field_y.length)

  const width = fieldX.reduce((c, i) => Math.max(c, i), 0)
  const height = fieldY.reduce((c, i) => Math.max(c, i), 0)

  return {
    comment: 'Union pattern',
    'urls': [],
    'short_comment': 'This is a union pattern.',
    'pattern_string': '',
    width,
    height,
    field_x: fieldX,
    field_y: fieldY,
    'title': 'minerva1'
  }
}

export const translate = (pattern, x, y) => {
  pattern.field_x = pattern.field_x.map(i => i + x)
  pattern.field_y = pattern.field_y.map(i => i + y)
  pattern.width += x
  pattern.height += y
  return pattern
}

export const flipX = (pattern) => {
  let max = null
  let min = null
  for (const n of pattern.field_x) {
    if (max === null || n > max) {
      max = n
    }
    if (min === null || n < min) {
      min = n
    }
  }
  const newFieldX = pattern.field_x.map(x => {
    return max - (x - min)
  })
  return {
    ...pattern,
    field_x: newFieldX
  }
}

export const flipY = (pattern) => {
  let max = null
  let min = null
  for (const n of pattern.field_y) {
    if (max === null || n > max) {
      max = n
    }
    if (min === null || n < min) {
      min = n
    }
  }
  const newFieldY = pattern.field_y.map(x => {
    return max - (x - min)
  })
  return {
    ...pattern,
    field_y: newFieldY
  }
}

export const flipXY = (p) => {
  return flipX(flipY(p))
}

const rotate = (matrix) => {
  return matrix[0].map((val, index) => matrix.map(row => row[index]).reverse())
}

export const rotatePattern = (p, rotations = 1) => {
  const grid = []
  const size = Math.max(p.height + 1, p.width + 1)
  while (grid.length < size) {
    grid.push([])
    while (grid[grid.length - 1].length < size) {
      grid[grid.length - 1].push(null)
    }
  }

  for (let i = 0; i < p.field_x.length; i++) {
    const xCoord = p.field_x[i]
    const yCoord = p.field_y[i] || 0
    grid[xCoord][yCoord] = 1
  }

  let r = grid

  while (rotations !== 0) {
    r = rotate(r)
    rotations--
  }

  p.field_x = []
  p.field_y = []

  for (let x = 0; x < r.length; x++) {
    for (let y = 0; y < r[x].length; y++) {
      if (r[x][y]) {
        p.field_x.push(x)
        p.field_y.push(y)
      }
    }
  }

  return p
}

export const rotate90 = (p) => {
  return rotatePattern(p)
}

export const rotate180 = (p) => {
  return rotatePattern(p, 2)
}

export const rotate270 = (p) => {
  return rotatePattern(p, 3)
}

export class Group {
  constructor () {
    this.comment = 'Union pattern'
    this.urls = []
    this.short_comment = 'This is a group pattern.'
    this.pattern_string = ''
    this.width = 0
    this.height = 0
    this.field_x = []
    this.field_y = []
    this.title = 'minerva1'
  }

  add (pattern, x = 0, y = 0) {
    const result = combine(this, pattern, x, y)

    this.field_x = result.field_x
    this.field_y = result.field_y
    this.height = result.height
    this.width = result.width
  }
}
