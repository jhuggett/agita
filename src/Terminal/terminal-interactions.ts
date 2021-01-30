import Color from "./color"
import Decorate from "./decoration"


export class Interactions {

  color = new Color()
  decorate = new Decorate()

  reactToKeyPress = async (callback?: (code: Buffer) => boolean) : Promise<Buffer> => {
    process.stdin.setRawMode(true)
    process.stdin.resume()

    return new Promise( (resolve) => {
        return process.stdin.once('data', (data) => {
            process.stdin.setRawMode(false)
            process.stdin.pause()
            if (callback && callback(data)) {
                this.reactToKeyPress(callback)
            }
            resolve(data)
        })
    })
}
  
  newLine = () => {
      this.write("\n")
      this.return()
  }

  return = () => {
      this.write("\r")
  }

  writeOnNewLine = (content) => {
      this.newLine()
      this.write(content)
  }

  writeWithNewLine = (content) => {
      this.write(content)
      this.newLine()
  }

  write = (content) => {
      process.stdout.write(content)
  }

  clear = () => {
      process.stdout.write("\033[2J")
      this.write("\033[H")
  }

  clearLine = () => {
      this.write("\u001b[2K")
  }

  hideCaret = () => {
      process.stderr.write("\u001B[?25l")
  }

  saveCursorSpot = () => {
      process.stderr.write("\u001B[s")
  }

  restoreCursorSpot = () => {
      process.stderr.write("\u001B[u")
  }

  showCaret = () => {
      process.stderr.write("\u001B[?25h")
  }

  getWidth = () => {
      return process.stdout.columns || 0
  }

  getHeight = () => {
      return process.stdout.rows || 0
  }
}