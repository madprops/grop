// Run npm install to get node dependencies

// System dependencies:
// notify-send
// xdotool
// wmctrl
// xwininfo

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
  let cmd = `xwininfo -id "${id}" -wm`
  let output = execSync(cmd).toString().trim()

  let titlebar_height = 0

  for(let line of output.split("\n")) {
    if (line.includes("Frame extents")) {
      let split = output.split("xtents:")
      let nums = split[split.length - 1]
      let num_splits = nums.split(", ")
      titlebar_height = parseInt(num_splits[2])
    }
  }

  return titlebar_height
}

function extract_number (s) {
  let match = s.match(/(^|\s)(-?\d+)($|\s)/g)

  if(match) {
    return parseInt(match[0].trim())
  } else {
    return 0
  }
}

function get_windows () {
  if (!fs.existsSync(fpath)) {
    console.info("Group does not exist.")
    process.exit(0)
  }

  return fs.readFileSync(fpath, 'utf8').split("\n")
}

function save_windows (content) {
  try {
    if (fs.existsSync(fpath)) {
      fs.unlinkSync(fpath)
    }
  
    if (!fs.existsSync(bpath)){
      fs.mkdirSync(bpath)
    }
  
    fs.writeFileSync(fpath, content)
  } catch (err) {
    console.error(err)
  }
}

function restore_group () {
  let windows = get_windows()

  for (let window of windows) {
    if (window) {
      let split = window.split(" ")
      let id = split[0]
      // let tbar = get_titlebar_height(id)
      let width = parseInt(split[1])
      let height = parseInt(split[2])
      let x = parseInt(split[3])
      let y = parseInt(split[4])
      
      console.info(`Restoring: ${window}`)
      execSync(`wmctrl -ir ${id} -b add,maximized_vert,maximized_horz`)
      execSync(`wmctrl -ir ${id} -b remove,maximized_vert,maximized_horz`)
      execSync(`wmctrl -ia "${id}" -e 4,${x},${y},${width},${height}`)
      execSync(`wmctrl -ia ${id}`)
    }
  }
}

if (!action) {
  let s = `Usage: 
  grop save mygroup = Start interactive mode
  grop restore mygroup = Restore group windows
  grop swap mygroup = Swap two windows from a group`
  console.info(s)
}

if (action === "restore") {
  restore_group()
}

else if (action === "save") {
  console.info(`Saving windows for ${gname}`)

  let windows = []

  let msg = `notify-send "Saving ${gname}\nPoint and press Ctrl on windows\nWithin the next ${time_to_pick} seconds"`
  execSync(msg)

  function done () {
    console.info(windows.join("\n"))

    let wins

    if (windows.length === 1) {
      wins = "window"
    } else {
      wins = "windows"
    }

    execSync(`notify-send "${windows.length} ${wins} saved"`)
    save_windows(windows.join("\n"))
    process.exit(0)
  }

  const ioHook = require('iohook')

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
          width = extract_number(line)
        } else if (line.includes('Height')) {
          height = extract_number(line)
        } else if (line.includes('Absolute upper-left X')) {
          x = extract_number(line)
        } else if (line.includes('Absolute upper-left Y')) {
          y = extract_number(line)
          y = extract_number(line)
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

else if (action === "swap") {
  let windows = get_windows()
  let items = []

  function done () {
    execSync(`notify-send "Swap time is up"`)
    process.exit(0)
  }

  let msg = `notify-send "Changing ${gname}\nPoint and press Ctrl on two windows\nWithin the next ${time_to_pick} seconds"`
  execSync(msg)

  const ioHook = require('iohook')

  ioHook.on("keydown", event => {
    if (event.keycode == 1) {
      execSync(`notify-send "Window swap aborted"`)
      process.exit(0)
    }

    else if (event.ctrlKey) {
      let cmd, output

      cmd = 'xdotool getmouselocation --shell 2>/dev/null | grep WINDOW'
      output = execSync(cmd).toString()
      let winid = output.replace(/\D+/g, '').trim()

      let ok = false
      let index = 0

      for (let i=0; i<windows.length; i++) {
        if (windows[i].split(" ")[0] == winid) {
          ok = true
          break
        }

        index += 1
      }

      for (let item of items) {
        if (item.id === winid) {
          ok = false
          break
        }
      }

      if (!ok) {
        return
      }

      items.push({id:winid, index:index})

      if (items.length === 2) {
        console.log(items)
        let split = windows[items[0].index].split(" ")
        let split2 = windows[items[1].index].split(" ")

        if (split[0] === items[0].id) {
          console.log(1)
          split[0] = items[1].id
          split2[0] = items[0].id
        } else {
          console.log(2)
          split[0] = items[0].id
          split2[0] = items[1].id
        }

        windows[items[0].index] = split.join(" ")
        windows[items[1].index] = split2.join(" ")
        save_windows(windows.join("\n"))
        execSync(`notify-send "Windows swapped"`)
        restore_group()
        process.exit(0)
      }
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