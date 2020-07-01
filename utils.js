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
    execSync(`notify-send "${msg}"`)
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

  Grop.start_hook = function (on_keydown, done) {
    const ioHook = require('iohook')
    ioHook.on("keydown", on_keydown)

    process.on('exit', () => {
      ioHook.unload()
    })

    setTimeout (function () {
      done()
    }, Grop.time_to_pick * 1000)

    ioHook.start()
  }
}