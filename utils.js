const fs = require('fs')
const path = require('path')
const execSync = require('child_process').execSync

module.exports = function (Grop) {
  Grop.extract_number = function (s) {
    let match = s.match(/(^|\s)(-?\d+)($|\s)/g)

    if(match) {
      return parseInt(match[0].trim())
    } else {
      return 0
    }
  }

  Grop.get_windows = function (num) {
    let file_path = Grop[`file_path_${num}`]

    if (!fs.existsSync(file_path)) {
      console.info("Group does not exist.")
      process.exit(0)
    }

    return fs.readFileSync(file_path, 'utf8').split("\n")
  }

  Grop.popup = function (msg) {
    execSync(`notify-send "Grop: ${msg}"`)
  }

  Grop.save_windows = function (num, content) {
    let file_path = Grop[`file_path_${num}`]
    let parent = path.dirname(file_path)

    try {
      if (fs.existsSync(file_path)) {
        fs.unlinkSync(file_path)
      }
  
      if (!fs.existsSync(parent)){
        fs.mkdirSync(parent)
      }
  
      fs.writeFileSync(file_path, content)
    } catch (err) {
      console.error(err)
    }
  }

  Grop.start_hook = function (on_keydown) {
    const ioHook = require('iohook')
    ioHook.on("keydown", on_keydown)

    process.on('exit', () => {
      ioHook.unload()
    })

    ioHook.start()
  }

  Grop.check_groups = function (n) {
    if (n === 1) {
      if (!Grop.group_name_1) {
        console.info("A group name must be provided.")
        process.exit(0)
      }
    } else if (n === 2) {
      if (!Grop.group_name_1 || !Grop.group_name_2) {
        console.info("Two group names must be provided.")
        process.exit(0)
      }
    }
  }

  Grop.start_max_timer = function (mode) {
    setTimeout(() => {
      Grop.popup(`${mode} terminated`)
      process.exit(0)
    }, 20 * 1000);
  }

  Grop.window_in_list = function (id, windows) {
    let index = 0
    let ok = false

    for (let i=0; i<windows.length; i++) {
      if (windows[i].split(" ")[0] == id) {
        ok = true
        break
      }

      index += 1
    }

    if (!ok) {
      index = -1
    }

    return index
  }

  Grop.select_window = function (winid = "") {
    let cmd, output

    if (!winid) {
      cmd = 'xdotool getmouselocation --shell 2>/dev/null | grep WINDOW'
      output = execSync(cmd).toString()
      winid = output.replace(/\D+/g, '').trim()
    }

    cmd = `xwininfo -id "${winid}"`
    output = execSync(cmd).toString()

    let width, height, x, y
    
    for(let line of output.split("\n")) {
      if (line.includes('Width')) {
        width = Grop.extract_number(line)
      } else if (line.includes('Height')) {
        height = Grop.extract_number(line)
      } else if (line.includes('Absolute upper-left X')) {
        x = Grop.extract_number(line)
      } else if (line.includes('Absolute upper-left Y')) {
        y = Grop.extract_number(line)
        y = Grop.extract_number(line)
      }
    }

    return `${winid} ${width} ${height} ${x} ${y}`
  }

  Grop.get_window_props = function (window) {
    let obj = {}
    let split = window.split(" ")
    obj.id = split[0]
    obj.width = parseInt(split[1])
    obj.height = parseInt(split[2])
    obj.x = parseInt(split[3])
    obj.y = parseInt(split[4])
    return obj
  }
}