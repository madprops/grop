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

if (!Grop.action) {
  let s = `Usage: 
  grop save mygroup = Start save mode
  grop restore mygroup = Restore group windows
  grop swap mygroup = Swap two windows from a group
  grop switch mygroup1 mygroup2 = Switch two groups
  grop trio-right = Tile a 3-column on the right side
  grop trio-left = Tile a 3-column on the left side`
  console.info(s)
}

require('./procs')(Grop)
require('./utils')(Grop)

if (args[1]) {
  Grop.group_name_1 = args[1]
  Grop.file_path_1 = path.normalize(`${home}/.config/grop/${Grop.group_name_1}`)
}

if (args[2]) {
  Grop.group_name_2 = args[2]
  Grop.file_path_2 = path.normalize(`${home}/.config/grop/${Grop.group_name_2}`)
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

else if (Grop.action === "trio-right") {
  Grop.trio("right")
}

else if (Grop.action === "trio-left") {
  Grop.trio("left")
}