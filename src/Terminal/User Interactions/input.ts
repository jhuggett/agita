import { UserInteractionView, UserInteractionResponse, ReactResponse, UserInteractionConfig } from "."
import { Terminal } from ".."

export interface InputConfig extends UserInteractionConfig {
  prompt: string
}

export interface InputResponse extends UserInteractionResponse {
  input: string
}

export class Input implements UserInteractionView {

  config: InputConfig

  constructor(private t: Terminal, config: InputConfig) { this.config = config }

  reactions: any = {
    3: {
      action: () => {
        process.exit()
      }
    },
    13: {
      action: () => {
        return true
      }
    },
    27: {
      65: { // up
        action: () => {
          this.moveCursor(0, -1)
          return false
        }
      },
      66: { // down
        action: () => {
          this.moveCursor(0, 1)
          return false
        }
      },
      67: { // right
        action: () => {
          this.moveCursor(1, 0)
          return false
        }
      },
      68: { // left
        action: () => {
          this.moveCursor(-1, 0)
          return false
        }
      }
    }, 
    127: { // backspace
      action: () => {
        this.removeInput()
        return false
      }
    },
    32: { // space
      action: () => {
        this.addInput(' ')
        return false 
      }
    }
  }

  input = ''

  cursorLocation = {
    x: 0,
    y: 0
  }

  moveCursor(x: number, y: number) {
    return // for now
    
    const [width, height] = this.t.interactor.widthAndHeight()

    if (x != 0 && this.cursorLocation.x + x < width && this.cursorLocation.x + x > 0) {
      this.cursorLocation.x += x
      this.t.interactor.moveCursor.moveBy(x, 0)
    }
    if (y != 0 && this.cursorLocation.y + y < height && this.cursorLocation.y + y > 0) {
      if (this.cursorLocation.y + y <= this.numberOfInputLines()) {
        this.cursorLocation.y += y
        this.t.interactor.moveCursor.moveBy(0, y)
      }
    }



  }

  numberOfInputLines() {
    return Math.abs(this.input.length / this.t.interactor.getWidth())
  }

  removeInput() {
    this.input = this.input.slice(0, -1)
  }

  addInput(char: string) {

    if (this.input.length + 7 < this.t.interactor.getWidth()) {
      this.input += char
    }
  }

  async run() : Promise<InputResponse> {

    this.t.interactor.showCaret()
    this.t.interactor.saveCursorSpot()

    let response: InputResponse | null = null
    let reactResponse: ReactResponse | null = null

    while (!response) {
      if (!reactResponse || reactResponse.rerender) this.render()
      reactResponse = await this.react()
      
      if (reactResponse.finished) response = { input: this.input }
    }

    this.t.interactor.hideCaret()

    return response
  }

  render() {
    this.t.interactor
    .restoreCursorSpot()
    .clearLine()
    .write(
      this.t.interactor.color.blue(
        this.t.interactor.decorate.bold(
          this.config.prompt
        )
      )
    )
    .write(this.input)
  }

  async react() : Promise<ReactResponse> {
    const key = await this.t.interactor.reactToKeyPress()
    
    let level = 0
    let reaction = this.reactions
    while (reaction && !reaction.action) {
      if (key[level]) {
        reaction = reaction[key[level]]
        level++
      } else break
    }

    let shouldRerender = false

    if (!reaction) {
      if (key[0] > 32 && key[0] < 127) {
        this.addInput(key.toString())
        shouldRerender = true
      }
    }

    return {
      finished: reaction && reaction.action ? reaction.action() : false,
      rerender: !!reaction || shouldRerender
    }
  }

}

