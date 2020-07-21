const fs = require('fs')
const execSync = require('child_process').execSync

module.exports = function (Grop) {
  Grop.restore_group = function () {
    Grop.check_groups(1)
    let windows = Grop.get_windows(1)

    for (let window of windows) {
      Grop.restore_window(window)
    }
  }

  Grop.restore_window = function (window) {
    if (!window) {
      return
    }

    console.info(`Restoring: ${window}`)

    let obj = Grop.get_window_props(window)
      
    try {
      execSync(`wmctrl -ir ${obj.id} -b add,maximized_vert,maximized_horz 2> /dev/null`)
      execSync(`wmctrl -ir ${obj.id} -b remove,maximized_vert,maximized_horz 2> /dev/null`)
      execSync(`wmctrl -ia "${obj.id}" -e 4,${obj.x},${obj.y},${obj.width},${obj.height} 2> /dev/null`)
      execSync(`wmctrl -ia ${obj.id} 2> /dev/null`)
    } catch (err) {
      console.error("Error restoring. It probably doesn't exist anymore.")
    }
  }

  Grop.save_group = function () {
    Grop.check_groups(1)
    let windows = []

    Grop.popup(`Saving ${Grop.group_name_1}\nPoint and press Ctrl on windows\nPress Escape to stop`)
    console.info(`Saving windows for ${Grop.group_name_1}`)

    function done () {
      if (windows.length === 0) {
        Grop.popup("No windows were selected")
        process.exit(0)
      }

      console.info(windows.join("\n"))

      let wins

      if (windows.length === 1) {
        wins = "window"
      } else {
        wins = "windows"
      }

      Grop.popup(`${windows.length} ${wins} saved on ${Grop.group_name_1}`)
      Grop.save_windows(1, windows.join("\n"))
      process.exit(0)
    }

    Grop.start_max_timer("Save mode")

    Grop.start_hook(async function (event) {
      if (event.keycode == 1) {
        done()
      }

      else if (event.ctrlKey) {
        let window = await Grop.select_window()

        if (Grop.window_in_list(window.split(" ")[0], windows) === -1) {
          windows.push(window)
        }
      }
    })
  }

  Grop.swap_windows = function () {
    Grop.check_groups(1)
    let windows = Grop.get_windows(1)
    let items = []
    let changed = false

    Grop.popup(`Swapping ${Grop.group_name_1}\nPoint and press Ctrl on two windows\nPress Escape to stop`)

    function done () {
      Grop.popup("Swap mode terminated")
      
      if (changed) {
        Grop.save_windows(1, windows.join("\n"))
      }

      process.exit(0) 
    }

    Grop.start_max_timer("Swap mode")

    Grop.start_hook(function (event) {
      if (event.keycode == 1) {
        done()
      }

      else if (event.ctrlKey) {
        let cmd, output

        cmd = 'xdotool getmouselocation --shell 2>/dev/null | grep WINDOW'
        output = execSync(cmd).toString()

        let winid = output.replace(/\D+/g, '').trim()
        let index = Grop.window_in_list(winid, windows)

        if (index === -1) {
          return
        }
        
        let ok = true

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
          let split = windows[items[0].index].split(" ")
          let split2 = windows[items[1].index].split(" ")

          if (split[0] === items[0].id) {
            split[0] = items[1].id
            split2[0] = items[0].id
          } else {
            split[0] = items[0].id
            split2[0] = items[1].id
          }

          windows[items[0].index] = split.join(" ")
          windows[items[1].index] = split2.join(" ")

          Grop.restore_window(windows[items[0].index])
          Grop.restore_window(windows[items[1].index])

          items = []
          changed = true
        }
      }
    })
  }

  Grop.switch_groups = function () {
    Grop.check_groups(2)

    if (!fs.existsSync(Grop.file_path_1)) {
      console.info(`${Grop.group_name_1} does not exist.`)
      process.exit(0)
    }

    if (!fs.existsSync(Grop.file_path_2)) {
      console.info(`${Grop.group_name_2} does not exist.`)
      process.exit(0)
    }

    let text_1 = fs.readFileSync(Grop.file_path_1, 'utf8')
    let text_2 = fs.readFileSync(Grop.file_path_2, 'utf8')

    Grop.save_windows(1, text_2)
    Grop.save_windows(2, text_1)
    
    let msg = `${Grop.group_name_1} switched with ${Grop.group_name_2}`
    console.info(msg)
    Grop.popup(msg)
  }

  Grop.trio = function (side) {
    let windows = []

    async function done () {
      if (windows.length !== 3) {
        process.exit(0)
      }

      let id = windows[0].split(" ")[0]
      execSync(`wmctrl -ir ${id} -b add,maximized_vert,maximized_horz 2> /dev/null`)
      await new Promise(done => setTimeout(() => done(), 100))
      let win = Grop.select_window(id)
      let obj = Grop.get_window_props(win)
      execSync(`wmctrl -ir ${obj.id} -b remove,maximized_vert,maximized_horz 2> /dev/null`)
      await new Promise(done => setTimeout(() => done(), 100))
      let cheight = obj.height / 3
      let cwidth = obj.width / 2
      let y = 0
      let x

      if (side === "right") {
        x = obj.x + cwidth
      } else if (side === "left") {
        x = obj.x
      }

      for (let window of windows) {
        let o = Grop.get_window_props(window)
        let w = `${o.id} ${cwidth} ${cheight} ${x} ${y}`
        Grop.restore_window(w)
        y += cheight
      }

      process.exit(0)
    }

    Grop.start_hook(function (event) {
      if (event.keycode == 1) {
        done()
      }

      else if (event.ctrlKey) {
        let window = Grop.select_window()

        if (Grop.window_in_list(window.split(" ")[0], windows) === -1) {
          windows.push(window)
        }

        if (windows.length === 3) {
          done()
        }
      }
    })    
  }
}