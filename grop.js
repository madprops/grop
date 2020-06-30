// Run npm install to get node dependencies

// System dependencies:
// notify-send
// xdotool
// wmctrl
// xwininfo

var path = require('path')

const Grop = {}
let args = process.argv.slice(2)
let home = require('os').homedir()

Grop.action = args[0]
Grop.group_name = args[1]
Grop.root_path = path.normalize(`${home}/.config/grop`)
Grop.file_path = path.normalize(`${Grop.root_path}/${Grop.group_name}`)
Grop.time_to_pick = 5

require('./procs')(Grop)
require('./utils')(Grop)

if (!Grop.action) {
  let s = `Usage: 
  grop save mygroup = Start interactive mode
  grop restore mygroup = Restore group windows
  grop swap mygroup = Swap two windows from a group`
  console.info(s)
}

else if (Grop.action === "restore") {
  Grop.restore_group()
}

else if (Grop.action === "save") {
  Grop.save_group()
}

else if (Grop.action === "swap") {
  Grop.swap_windows()
}