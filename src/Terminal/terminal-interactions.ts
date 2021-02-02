import Color from "./color"
import Decorate from "./decoration"
import CursorMovement from "./cursor-move"
import { Terminal } from "."


export class Interactions {

    constructor(private t: Terminal) {}

    color = new Color()
    decorate = new Decorate()
    moveCursor = new CursorMovement(this.t)

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

    moveCursorToBottom = () : Interactions => {
        this.moveCursor.moveTo(0, this.getHeight())
        return this
    }

    newLine = () : Interactions => {
        this.write("\n")
        this.return()
        
        return this
    }

    return = () : Interactions => {
        this.write("\r")
        
        return this
    }

    writeOnNewLine = (content) : Interactions => {
        this.newLine()
        this.write(content)
        
        return this
    }

    writeWithNewLine = (content) : Interactions => {
        this.write(content)
        this.newLine()
        
        return this
    }

    write = (content) : Interactions => {
        process.stdout.write(content)
        
        return this
    }

    clear = () : Interactions => {
        process.stdout.write("\033[2J")
        this.write("\033[H")
        
        return this
    }

    clearLine = () : Interactions => {
        this.write("\u001b[2K")
        
        return this
    }

    hideCaret = () : Interactions => {
        process.stderr.write("\u001B[?25l")
        
        return this
    }

    saveCursorSpot = () : Interactions => {
        process.stderr.write("\u001B[s")
        
        return this
    }

    restoreCursorSpot = () : Interactions => {
        process.stderr.write("\u001B[u")
        
        return this
    }

    showCaret = () : Interactions => {
        process.stderr.write("\u001B[?25h")
        
        return this
    }

    getWidth = () => {
        return process.stdout.columns || 0
    }

    getHeight = () => {
        return process.stdout.rows || 0
    }
}