const execSync = require('child_process').execSync

module.exports = function (Grop) {
  Grop.restore_group = function () {
    let windows = Grop.get_windows()

    for (let window of windows) {
      if (window) {
        let split = window.split(" ")
        let id = split[0]
        let width = parseInt(split[1])
        let height = parseInt(split[2])
        let x = parseInt(split[3])
        let y = parseInt(split[4])
      
        console.info(`Restoring: ${window}`)
        
        try {
          execSync(`wmctrl -ir ${id} -b add,maximized_vert,maximized_horz 2> /dev/null`)
          execSync(`wmctrl -ir ${id} -b remove,maximized_vert,maximized_horz 2> /dev/null`)
          execSync(`wmctrl -ia "${id}" -e 4,${x},${y},${width},${height} 2> /dev/null`)
          execSync(`wmctrl -ia ${id} 2> /dev/null`)
        } catch (err) {
          console.error("Error restoring. It probably doesn't exist anymore.")
        }
      }
    }
  }

  Grop.save_group = function () {
    let windows = []
    Grop.popup(`Saving ${Grop.group_name}\nPoint and press Ctrl on windows\nWithin the next ${Grop.time_to_pick} seconds`)
    console.info(`Saving windows for ${Grop.group_name}`)

    Grop.start_hook(function (event) {
      if (event.keycode == 1) {
        Grop.popup("Group save aborted")
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

        let window = `${winid} ${width} ${height} ${x} ${y}`
        windows.push(window)
      }
    }, function () {
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

      Grop.popup(`${windows.length} ${wins} saved`)
      Grop.save_windows(windows.join("\n"))
      process.exit(0)
    })
  }

  Grop.swap_windows =function () {
    let windows = Grop.get_windows()
    let items = []

    Grop.popup(`Changing ${Grop.group_name}\nPoint and press Ctrl on two windows\nWithin the next ${Grop.time_to_pick} seconds`)

    Grop.start_hook(function (event) {
      if (event.keycode == 1) {
        Grop.popup("Window swap aborted")
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
          Grop.save_windows(windows.join("\n"))
          Grop.popup("Windows swapped")
          Grop.restore_group()
          process.exit(0)
        }
      }
    }, function () {
      Grop.popup("Swap time is up")
      process.exit(0)
    })
  }
}