// Run npm install to get node dependencies

// System dependencies:
// notify-send
// xdotool
// wmctrl
// xwininfo

const path = require('path')

const Grop = {}
const args = process.argv.slice(2)
const home = require('os').homedir()

Grop.action = args[0]

if (args[1]) {
  Grop.group_name_1 = args[1]
  Grop.file_path_1 = path.normalize(`${home}/.config/grop/${Grop.group_name_1}`)
}

if (args[2]) {
  Grop.group_name_2 = args[2]
  Grop.file_path_2 = path.normalize(`${home}/.config/grop/${Grop.group_name_2}`)
}

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

else if (Grop.action === "switch") {
  Grop.switch_groups()
}