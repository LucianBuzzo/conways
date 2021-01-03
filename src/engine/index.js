import {
  LifeCanvasDrawer
} from './draw'
import {
  LifeUniverse
} from './life'
const {
  formats
} = require('./formats')

/*
 * TODO:
 * - remember settings in the hash or offer link
 * - life 1.05 is currently broken
 * - better mobile handling: allow drawing
 * - jump to coordinate
 * - make screenshots, maybe gifs
 * - allow people to upload patterns
 * - maybe more than 2 states (non-life)
 * - fail-safe http requests and pattern parsing
 * - restore meta life
 * - error when zooming while pattern is loading
 * - run http://copy.sh/life/?pattern=demonoid_synth without crashing (improve memory efficiency)
 * - some patterns break randomly (hard to reproduce, probably related to speed changing)
 */

/** @const */
var DEFAULT_BORDER = 0.25

/** @const */

var DEFAULT_FPS = 20;

// var console = console || { log : function() {} };
var initial_title = document.title
var initial_description = ''

if (!document.addEventListener) {
  // IE 8 seems to switch into rage mode if the code is only loaded partly,
  // so we are saying goodbye earlier
  return
}

var

  /**
       * which pattern file is currently loaded
       * @type {{title: String, urls, comment, view_url, source_url}}
       * */
  current_pattern

// functions which is called when the pattern stops running
/** @type {function()|undefined} */

var onstop

var last_mouse_x

var last_mouse_y

var mouse_set

// is the game running ?
/** @type {boolean} */

var running = false

/** @type {number} */

var max_fps

// has the pattern list been loaded
/** @type {boolean} */

var patterns_loaded = false

/**
       * path to the folder with all patterns
       * @const
       */

var pattern_path = 'examples/'

var loaded = false

// example setups which are run at startup
// loaded from examples/
/** @type {Array.<string>} */

var examples = (
  'turingmachine,Turing Machine|gunstar,Gunstar|hacksaw,Hacksaw|tetheredrake,Tethered rake|' +
          'primer,Primer|infinitegliderhotel,Infinite glider hotel|' +
          'p94s,P94S|breeder1,Breeder 1|tlogtgrowth,tlog(t) growth|' +
          'logt2growth,Log(t)^2 growth|infinitelwsshotel,Infinite LWSS hotel|c5greyship,c/5 greyship'
).split('|')

/** @type {function(function())} */
var nextFrame =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      setTimeout

/** @param {*=} absolute */
function rle_link (id, absolute) {
  if (!id.endsWith('.mc')) {
    id = id + '.rle'
  }

  if (!absolute || location.hostname === 'localhost') {
    return pattern_path + id
  } else {
    let protocol = location.protocol === 'http:' ? 'http:' : 'https:'
    return protocol + '//copy.sh/life/' + pattern_path + id
  }
}

function view_link (id) {
  let protocol = location.protocol === 'http:' ? 'http:' : 'https:'
  return protocol + '//copy.sh/life/?pattern=' + id
}

/**
   * @param {function()=} callback
   */
function stop (callback) {
  if (running) {
    running = false
    set_text($('run_button'), 'Run')

    onstop = callback
  } else {
    if (callback) {
      callback()
    }
  }
}

/**
   * @param {string=} pattern_source_url
   * @param {string=} view_url
   * @param {string=} title
   */
function setup_pattern (result, pattern_id) {
  stop(function () {
    if (pattern_id && !result.title) {
      result.title = pattern_id
    }

    life.clear_pattern()

    var bounds = life.get_bounds(result.field_x, result.field_y)
    life.make_center(result.field_x, result.field_y, bounds)
    life.setup_field(result.field_x, result.field_y, bounds)

    life.save_rewind_state()

    if (result.rule_s && result.rule_b) {
      life.set_rules(result.rule_s, result.rule_b)
    } else {
      life.set_rules(1 << 2 | 1 << 3, 1 << 3)
    }

    hide_overlay()

    fit_pattern()
    drawer.redraw(life.root)

    update_hud()
    set_text($('pattern_name'), result.title || 'no name')
    set_title(result.title)

    document.querySelector('meta[name=description]').content =
              result.comment.replace(/\n/g, ' - ') + ' - ' + initial_description

    current_pattern = {
      title: result.title,
      comment: result.comment,
      urls: result.urls,
      view_url: '',
      source_url: ''
    }
  })
}

function show_alert (pattern) {
  if (pattern.title || pattern.comment || pattern.urls.length) {
    show_overlay('alert')

    set_text($('pattern_title'), pattern.title || '')
    set_text($('pattern_description'), pattern.comment || '')

    $('pattern_urls').innerHTML = ''
    for (let url of pattern.urls) {
      let a = document.createElement('a')
      a.href = url
      a.textContent = url
      a.target = '_blank'
      $('pattern_urls').appendChild(a)
      $('pattern_urls').appendChild(document.createElement('br'))
    }

    if (pattern.view_url) {
      show_element($('pattern_link_container'))
      set_text($('pattern_link'), pattern.view_url)
      $('pattern_link').href = pattern.view_url
    } else {
      hide_element($('pattern_link_container'))
    }

    if (pattern.source_url) {
      show_element($('pattern_file_container'))
      set_text($('pattern_file_link'), pattern.source_url)
      $('pattern_file_link').href = pattern.source_url
    } else {
      hide_element($('pattern_file_container'))
    }
  }
}

function show_overlay (overlay_id) {
  show_element($('overlay'))

  // allow scroll bars when overlay is visible
  document.body.style.overflow = 'auto'

  var overlays = $('overlay').children

  for (var i = 0; i < overlays.length; i++) {
    var child = overlays[i]

    if (child.id === overlay_id) {
      show_element(child)
    } else {
      hide_element(child)
    }
  }
}

function hide_overlay () {
  hide_element($('overlay'))
  document.body.style.overflow = 'hidden'
}


function set_text (obj, text) {
  obj.textContent = String(text)
}

/**
   * fixes the width of an element to its current size
   */
function fix_width (element) {
  element.style.padding = '0'
  element.style.width = ''

  if (!element.last_width || element.last_width < element.offsetWidth) {
    element.last_width = element.offsetWidth
  }
  element.style.padding = ''

  element.style.width = element.last_width + 'px'
}

function validate_color (color_str) {
  return /^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/i.test(color_str) ? color_str : false
}

/**
   * @param {function(string,number)=} onerror
   */
function http_get (url, onready, onerror) {
  var http = new XMLHttpRequest()

  http.onreadystatechange = function () {
    if (http.readyState === 4) {
      if (http.status === 200) {
        onready(http.responseText, url)
      } else {
        if (onerror) {
          onerror(http.responseText, http.status)
        }
      }
    }
  }

  http.open('get', url, true)
  http.send('')

  return {
    cancel: function () {
      http.abort()
    }
  }
}

function http_get_multiple (urls, ondone, onerror) {
  var count = urls.length

  var done = 0

  var error = false

  var handlers

  handlers = urls.map(function (url) {
    return http_get(
      url.url,
      function (result) {
        // a single request was successful

        if (error) {
          return
        }

        if (url.onready) {
          url.onready(result)
        }

        done++

        if (done === count) {
          ondone()
        }
      },
      function (result, status_code) {
        // a single request has errored

        if (!error) {
          error = true

          onerror()

          for (var i = 0; i < handlers.length; i++) {
            handlers[i].cancel()
          }
        }
      }
    )
  })
}

/*
   * The mousemove event which draw pixels
   */
function do_field_draw (e) {
  var coords = drawer.pixel2cell(e.clientX, e.clientY)

  // don't draw the same pixel twice
  if (coords.x !== last_mouse_x || coords.y !== last_mouse_y) {
    life.set_bit(coords.x, coords.y, mouse_set)
    update_hud()

    drawer.draw_cell(coords.x, coords.y, mouse_set)
    last_mouse_x = coords.x
    last_mouse_y = coords.y
  }
}

function $ (id) {
  return document.getElementById(id)
}

function set_query (filename) {
  if (!window.history.replaceState) {
    return
  }

  if (filename) {
    window.history.replaceState(null, '', '?pattern=' + filename)
  } else {
    window.history.replaceState(null, '', '/life/')
  }
}

/** @param {string=} title */
function set_title (title) {
  if (title) {
    document.title = title + ' - ' + initial_title
  } else {
    document.title = initial_title
  }
}

function hide_element (node) {
  node.style.display = 'none'
}

function show_element (node) {
  node.style.display = 'block'
}

function pad0 (str, n) {
  while (str.length < n) {
    str = '0' + str
  }

  return str
}

// Put sep as a seperator into the thousands spaces of and Integer n
// Doesn't handle numbers >= 10^21
function format_thousands (n, sep) {
  if (n < 0) {
    return '-' + format_thousands(-n, sep)
  }

  if (isNaN(n) || !isFinite(n) || n >= 1e21) {
    return n + ''
  }

  function format (str) {
    if (str.length < 3) {
      return str
    } else {
      return format(str.slice(0, -3)) + sep + str.slice(-3)
    }
  }

  return format(n + '')
}

function debounce (func, timeout) {
  var timeout_id

  return function () {
    var me = this

    var args = arguments

    clearTimeout(timeout_id)

    timeout_id = setTimeout(function () {
      func.apply(me, Array.prototype.slice.call(args))
    }, timeout)
  }
}

function download (text, name) {
  var a = document.createElement('a')
  a['download'] = name
  a.href = window.URL.createObjectURL(new Blob([text]))
  a.dataset['downloadurl'] = ['text/plain', a['download'], a.href].join(':')

  if (document.createEvent) {
    var ev = document.createEvent('MouseEvent')
    ev.initMouseEvent('click', true, true, window,
      0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(ev)
  } else {
    a.click()
  }

  window.URL.revokeObjectURL(a.href)
}

export class Engine {
  constructor() {
    this.life = new LifeUniverse()
    this.drawer = new LifeCanvasDrawer()
    this.loaded = false
  }

  init() {
    if (this.loaded) {
      // onload has been called already
      return
    }

    this.loaded = true
    const drawer = this.drawer
    const life = this.life
    drawer.init(document.body)
    const update_hud = this.update_hud.bind(this)
    const step = this.step.bind(this)
    const lazy_redraw = this.lazy_redraw.bind(this)
    const do_field_move = this.do_field_move.bind(this)
    const run = this.run.bind(this)

    init_ui()

    drawer.set_size(window.innerWidth, document.body.offsetHeight)
    this.reset_settings()

    function init_ui () {
      $('about_close').style.display = 'inline'

      hide_element($('notice'))
      hide_overlay()

      show_element($('toolbar'))
      show_element($('statusbar'))
      show_element($('about_main'))

      var style_element = document.createElement('style')
      document.head.appendChild(style_element)

      window.onresize = debounce(function () {
        drawer.set_size(window.innerWidth, document.body.offsetHeight)

        requestAnimationFrame(lazy_redraw.bind(0, life.root))
      }, 500)

      $('gen_step').onchange = function (e) {
        if (this.type === 'number') {
          var value = Number(this.value)

          if (!value) {
            return
          }

          var closest_pow2 = Math.pow(2, Math.round(Math.log(value) / Math.LN2))
          if (value <= 1) {
            this.value = 1
          } else {
            this.value = closest_pow2
          }

          this.step = this.value / 2
        }
      }

      $('run_button').onclick = function () {
        if (running) {
          stop()
        } else {
          run()
        }
      }

      $('step_button').onclick = function () {
        if (!running) {
          step(true)
        }
      }

      $('superstep_button').onclick = function () {
        if (!running) {
          step(false)
        }
      }

      $('rewind_button').onclick = function () {
        if (life.rewind_state) {
          stop(function () {
            life.restore_rewind_state()

            fit_pattern()
            drawer.redraw(life.root)

            update_hud()
          })
        }
      }

      drawer.canvas.onmousedown = function (e) {
        if (e.which === 3 || e.which === 2) {
          if (drawer.cell_width >= 1) // only at reasonable zoom levels
          {
            var coords = drawer.pixel2cell(e.clientX, e.clientY)

            mouse_set = !life.get_bit(coords.x, coords.y)

            window.addEventListener('mousemove', do_field_draw, true)
            do_field_draw(e)
          }
        } else if (e.which === 1) {
          last_mouse_x = e.clientX
          last_mouse_y = e.clientY
          // console.log("start", e.clientX, e.clientY);

          window.addEventListener('mousemove', do_field_move, true);

          (function redraw () {
            if (last_mouse_x !== null) {
              requestAnimationFrame(redraw)
            }

            lazy_redraw(life.root)
          })()
        }

        return false
      }

      var scaling = false
      var last_distance = 0

      function distance (touches) {
        console.assert(touches.length >= 2)

        return Math.sqrt(
          (touches[0].clientX - touches[1].clientX) * (touches[0].clientX - touches[1].clientX) +
                    (touches[0].clientY - touches[1].clientY) * (touches[0].clientY - touches[1].clientY))
      }

      drawer.canvas.addEventListener('touchstart', function (e) {
        if (e.touches.length === 2) {
          scaling = true
          last_distance = distance(e.touches)
          e.preventDefault()
        } else if (e.touches.length === 1) {
          // left mouse simulation
          var ev = {
            which: 1,
            clientX: e.changedTouches[0].clientX,
            clientY: e.changedTouches[0].clientY
          }

          drawer.canvas.onmousedown(ev)

          e.preventDefault()
        }
      }, false)

      drawer.canvas.addEventListener('touchmove', function (e) {
        if (scaling) {
          let new_distance = distance(e.touches)
          let changed = false
          const MIN_DISTANCE = 50

          while (last_distance - new_distance > MIN_DISTANCE) {
            last_distance -= MIN_DISTANCE
            drawer.zoom_centered(true)
            changed = true
          }

          while (last_distance - new_distance < -MIN_DISTANCE) {
            last_distance += MIN_DISTANCE
            drawer.zoom_centered(false)
            changed = true
          }

          if (changed) {
            update_hud()
            lazy_redraw(life.root)
          }
        } else {
          var ev = {
            clientX: e.changedTouches[0].clientX,
            clientY: e.changedTouches[0].clientY
          }

          do_field_move(ev)

          e.preventDefault()
        }
      }, false)

      drawer.canvas.addEventListener('touchend', function (e) {
        window.onmouseup(e)
        e.preventDefault()
        scaling = false
      }, false)

      drawer.canvas.addEventListener('touchcancel', function (e) {
        window.onmouseup(e)
        e.preventDefault()
        scaling = false
      }, false)

      window.onmouseup = function (e) {
        last_mouse_x = null
        last_mouse_y = null

        window.removeEventListener('mousemove', do_field_draw, true)
        window.removeEventListener('mousemove', do_field_move, true)
      }

      window.onmousemove = function (e) {
        var coords = drawer.pixel2cell(e.clientX, e.clientY)

        set_text($('label_mou'), coords.x + ', ' + coords.y)
        fix_width($('label_mou'))
      }

      drawer.canvas.oncontextmenu = function (e) {
        return false
      }

      drawer.canvas.onmousewheel = function (e) {
        e.preventDefault()
        drawer.zoom_at((e.wheelDelta || -e.detail) < 0, e.clientX, e.clientY)

        update_hud()
        lazy_redraw(life.root)
        return false
      }

      drawer.canvas.addEventListener('DOMMouseScroll', drawer.canvas.onmousewheel, false)

      $('faster_button').onclick = function () {
        var step = life.step + 1

        life.set_step(step)
        set_text($('label_step'), Math.pow(2, step))
      }

      $('slower_button').onclick = function () {
        if (life.step > 0) {
          var step = life.step - 1

          life.set_step(step)
          set_text($('label_step'), Math.pow(2, step))
        }
      }

      $('normalspeed_button').onclick = function () {
        life.set_step(0)
        set_text($('label_step'), 1)
      }

      $('zoomin_button').onclick = function () {
        drawer.zoom_centered(false)
        update_hud()
        lazy_redraw(life.root)
      }

      $('zoomout_button').onclick = function () {
        drawer.zoom_centered(true)
        update_hud()
        lazy_redraw(life.root)
      }

      $('initial_pos_button').onclick = function () {
        fit_pattern()
        lazy_redraw(life.root)
        update_hud()
      }

      $('middle_button').onclick = function () {
        drawer.center_view()
        lazy_redraw(life.root)
      }

      var positions = [
        ['ne', 1, -1],
        ['nw', -1, -1],
        ['se', 1, 1],
        ['sw', -1, 1],
        ['n', 0, -1],
        ['e', -1, 0],
        ['s', 0, 1],
        ['w', 1, 0]
      ]

      for (var i = 0; i < positions.length; i++) {
        var node = document.getElementById(positions[i][0] + '_button')

        node.onclick = (function (info) {
          return function () {
            drawer.move(info[1] * -30, info[2] * -30)
            lazy_redraw(life.root)
          }
        })(positions[i])
      }

      var select_rules = $('select_rules').getElementsByTagName('span')

      for (var i = 0; i < select_rules.length; i++) {
        /** @this {Element} */
        select_rules[i].onclick = function () {
          $('rule').value = this.getAttribute('data-rule')
        }
      }
    }
  }

  load(result, pattern_id) {
    const life = this.life
    const drawer = this.drawer
    const fit_pattern = this.fit_pattern.bind(this)
    const update_hud = this.update_hud.bind(this)

    stop(function () {
      if (pattern_id && !result.title) {
        result.title = pattern_id
      }

      life.clear_pattern()

      var bounds = life.get_bounds(result.field_x, result.field_y)
      life.make_center(result.field_x, result.field_y, bounds)
      life.setup_field(result.field_x, result.field_y, bounds)

      life.save_rewind_state()

      if (result.rule_s && result.rule_b) {
        life.set_rules(result.rule_s, result.rule_b)
      } else {
        life.set_rules(1 << 2 | 1 << 3, 1 << 3)
      }

      hide_overlay()

      fit_pattern()
      drawer.redraw(life.root)

      update_hud()
      set_text($('pattern_name'), result.title || 'no name')
      set_title(result.title)

      current_pattern = {
        title: result.title,
        comment: result.comment,
        urls: result.urls,
        view_url: '',
        source_url: ''
      }
    })
  }

  fit_pattern () {
    var bounds = this.life.get_root_bounds()

    this.drawer.fit_bounds(bounds)
  }

  reset_settings () {
    const drawer = this.drawer
    const life = this.life

    drawer.background_color = '#000000'
    drawer.cell_color = '#cccccc'

    drawer.border_width = DEFAULT_BORDER
    drawer.cell_width = 2

    life.rule_b = 1 << 3
    life.rule_s = 1 << 2 | 1 << 3
    life.set_step(0)
    set_text($('label_step'), '1')

    max_fps = DEFAULT_FPS

    set_text($('label_zoom'), '1:2')
    fix_width($('label_mou'))

    drawer.center_view()
  }

  update_hud (fps) {
    const drawer = this.drawer
    const life = this.life
    if (fps) {
      set_text($('label_fps'), fps.toFixed(1))
    }

    set_text($('label_gen'), format_thousands(life.generation, '\u202f'))
    fix_width($('label_gen'))

    set_text($('label_pop'), format_thousands(life.root.population, '\u202f'))
    fix_width($('label_pop'))

    if (drawer.cell_width >= 1) {
      set_text($('label_zoom'), '1:' + drawer.cell_width)
    } else {
      set_text($('label_zoom'), 1 / drawer.cell_width + ':1')
    }
  }

  lazy_redraw (node) {
    if (!running || max_fps < 15) {
      this.drawer.redraw(node)
    }
  }

  run() {
    var n = 0

    var start

    var last_frame

    var frame_time = 1000 / max_fps

    var interval

    var per_frame = frame_time
    const life = this.life
    const drawer = this.drawer
    const fit_pattern = this.fit_pattern.bind(this)
    const update_hud = this.update_hud.bind(this)

    set_text($('run_button'), 'Stop')

    running = true

    if (life.generation === 0) {
      life.save_rewind_state()
    }

    interval = setInterval(function () {
      update_hud(1000 / frame_time)
    }, 666)

    start = Date.now()
    last_frame = start - per_frame

    function update () {
      if (!running) {
        clearInterval(interval)
        update_hud(1000 / frame_time)

        if (onstop) {
          onstop()
        }
        return
      }

      var time = Date.now()

      if (per_frame * n < (time - start)) {
        life.next_generation(true)
        drawer.redraw(life.root)

        n++

        // readability ... my ass
        frame_time += (-last_frame - frame_time + (last_frame = time)) / 15

        if (frame_time < 0.7 * per_frame) {
          n = 1
          start = Date.now()
        }
      }

      nextFrame(update)
    }

    update()

  }

  step (is_single) {
    var time = Date.now()

    if (this.life.generation === 0) {
      this.life.save_rewind_state()
    }

    this.life.next_generation(is_single)
    this.drawer.redraw(this.life.root)

    this.update_hud(1000 / (Date.now() - time))

    if (time < 3) {
      set_text($('label_fps'), '> 9000')
    }
  }

  setGeneration (gen) {
    let time = Date.now()
    let count = 0

    if (this.life.generation === 0) {
      this.life.save_rewind_state()
    }

    while (count < gen) {
      count++
      this.life.next_generation(true)
    }

    this.drawer.redraw(this.life.root)

    this.update_hud(1000 / (Date.now() - time))
  }

  /*
   * The mousemove event which allows moving around
   */
  do_field_move (e) {
    if (last_mouse_x !== null) {
      let dx = Math.round(e.clientX - last_mouse_x)
      let dy = Math.round(e.clientY - last_mouse_y)

      this.drawer.move(dx, dy)

      // lazy_redraw(life.root);

      last_mouse_x += dx
      last_mouse_y += dy
    }
  }

  static parse(text) {
    return formats.parse_pattern(text.trim())
  }
}
