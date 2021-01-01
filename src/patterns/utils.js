export const combinePatterns = (p1, p2, xOffset = 0, yOffset = 0) => {
  const fieldX = new Int32Array(p1.field_x.length + p2.field_x.length)
  fieldX.set(p1.field_x)
  fieldX.set(p2.field_x.map(n => n + xOffset), p1.field_x.length)

  const fieldY = new Int32Array(p1.field_y.length + p2.field_y.length)
  fieldY.set(p1.field_y)
  fieldY.set(p2.field_y.map(n => n + yOffset), p1.field_y.length)

  return {
    comment: 'Union pattern',
    'urls': [],
    'short_comment': 'This is a union pattern.',
    'pattern_string': '',
    'width': 3,
    'height': 3,
    field_x: fieldX,
    field_y: fieldY,
    'title': 'minerva1'
  }
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
