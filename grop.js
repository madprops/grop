// Run npm install to get node dependencies

// System dependencies:
// notify-send
// xdotool
// wmctrl

var fs = require('fs')
var path = require('path')
const execSync = require('child_process').execSync
const home = require('os').homedir()
const args = process.argv.slice(2)
const action = args[0]
const gname = args[1]
const bpath = path.normalize(`${home}/.config/grop`)
const fpath = path.normalize(`${bpath}/${gname}`)
const time_to_pick = 5

function get_titlebar_height (id) {
  let cmd = `xwininfo -id "${id}" -wm | grep "Frame extents"`
  let output = execSync(cmd).toString().trim()

  let titlebar_height = 0

  if (output) {
    let split = output.split("xtents:")
    let nums = split[split.length - 1]
    let num_splits = nums.split(", ")
    titlebar_height = parseInt(num_splits[2])
  }

  return titlebar_height
}

if (!action) {
  let s = `Usage: 
  grop save mygroup = Start interactive mode
  grop restore mygroup = Restore group windows`
  console.info(s)
}

else if (action === "save") {
  console.info(`Saving windows for ${gname}`)

  let windows = []

  let msg = `notify-send "Saving ${gname}\nPoint and press Ctrl on windows\nWithin the next ${time_to_pick} seconds"`
  execSync(msg)

  const ioHook = require('iohook')

  function done () {
    console.info(windows.join("\n"))

    let wins

    if (windows.length === 1) {
      wins = "window"
    } else {
      wins = "windows"
    }

    execSync(`notify-send "${windows.length} ${wins} saved"`)

    try {
      if (fs.existsSync(fpath)) {
        fs.unlinkSync(fpath)
      }
  
      if (!fs.existsSync(bpath)){
        fs.mkdirSync(bpath)
      }
  
      fs.writeFileSync(fpath, windows.join("\n"))
    } catch (err) {
      console.error(err)
    }

    process.exit(0)
  }

  ioHook.on("keydown", event => {
    if (event.keycode == 1) {
      execSync(`notify-send "Group save aborted"`)
      process.exit(0)
    }

    else if (event.ctrlKey) {
      let cmd, output

      cmd = 'xdotool getmouselocation --shell 2>/dev/null | grep WINDOW'
      output = execSync(cmd).toString()
      let winid = output.replace(/\D+/g, '').trim()

      for (let window of windows) {
        if (window.split(" ")[0] == winid) {
          return
        }
      }

      cmd = `xwininfo -id "${winid}"`
      output = execSync(cmd).toString()

      let width, height, x, y
      
      for(let line of output.split("\n")) {
        if (line.includes('Width')) {
          width = parseInt(line.replace(/\D+/g, '').trim())
        } else if (line.includes('Height')) {
          height =parseInt( line.replace(/\D+/g, '').trim())
        } else if (line.includes('Absolute upper-left X')) {
          x = parseInt(line.replace(/\D+/g, '').trim())
        } else if (line.includes('Absolute upper-left Y')) {
          y = parseInt(line.replace(/\D+/g, '').trim())
        }
      }

      let window = `${winid} ${width} ${height} ${x} ${y}`
      windows.push(window)
    }
  })

  process.on('exit', () => {
    ioHook.unload()
  })

  setTimeout (function () {
    done()
  }, time_to_pick * 1000)

  ioHook.start()
}

else if (action === "restore") {
  if (!fs.existsSync(fpath)) {
    return "Group does not exist."
  }

  let windows = fs.readFileSync(fpath, 'utf8').split("\n")

  for (let window of windows) {
    if (window) {
      let split = window.split(" ")
      let id = split[0]
      let width = parseInt(split[1])
      let height = parseInt(split[2])
      let x = parseInt(split[3])
      let y = parseInt(split[4])
      
      console.info(`Restoring: ${window}`)
      execSync(`wmctrl -ir ${id} -b add,maximized_vert,maximized_horz`)
      execSync(`wmctrl -ir ${id} -b remove,maximized_vert,maximized_horz`)
      execSync(`xdotool windowsize ${id} ${width} ${height}`)
      execSync(`xdotool windowmove ${id} ${x} ${y}`)
      execSync(`wmctrl -ia ${id}`)
    }
  }
}