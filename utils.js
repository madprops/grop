var fs = require('fs')
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

  Grop.get_windows = function () {
    if (!fs.existsSync(Grop.file_path)) {
      console.info("Group does not exist.")
      process.exit(0)
    }

    return fs.readFileSync(Grop.file_path, 'utf8').split("\n")
  }

  Grop.popup = function (msg) {
    execSync(`notify-send "${msg}"`)
  }

  Grop.save_windows = function (content) {
    try {
      if (fs.existsSync(Grop.file_path)) {
        fs.unlinkSync(Grop.file_path)
      }
  
      if (!fs.existsSync(Grop.root_path)){
        fs.mkdirSync(Grop.root_path)
      }
  
      fs.writeFileSync(Grop.file_path, content)
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