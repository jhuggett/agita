import { UserInteractionView, UserInteractionResponse, ReactResponse, UserInteractionConfig } from "."
import { Terminal } from ".."

interface SelectListConfig extends UserInteractionConfig {
  text?: string
  options: string[]
  back?: string
}

export interface SelectListResponse extends UserInteractionResponse {
  selectedItem: string
  index: number
}

export class SelectList implements UserInteractionView {
  config: SelectListConfig

  reactions: any = {
    3: {
      action: () => { process.exit() }
    },
    27: {
      91: {
        65: { // up
          action: () => {
            this.selected = this.selected - 1 < 0 ? this.config.options.length - 1 : this.selected - 1
            return false
          }
        },
        66: { // down 
          action: () => {
              this.selected = this.selected + 1 > this.config.options.length - 1 ? 0 : this.selected + 1
              return false
          }
        },
        67: { // right
          action: () => {
            return true
          }
        },
        68: { // left
          action: () => {
            if (this.config.back) {
              this.selected = this.config.options.length
              return true
            }
          }
        }

      }
    },
    13: { // enter
      action: () => {
        return true
      }
    }
  }

  constructor(private t: Terminal, config: SelectListConfig) { this.config = config; if (this.config.back) this.config.options.push(this.config.back) }


  selected = 0

  async run() : Promise<SelectListResponse> {
    this.t.interactor.hideCaret()
    this.t.interactor.saveCursorSpot()

    let response: SelectListResponse | null = null
    let reactResponse: ReactResponse | null = null

    while(!response) {
      if (!reactResponse || reactResponse.rerender) this.render()
      reactResponse = await this.react()
      if (reactResponse.finished) {
        response = {
          selectedItem: this.config.options[this.selected],
          index: this.config.back && this.selected == this.config.options.length ? -1 : this.selected 
        }
      }
    }

    return response
  }

  render() {

    this.t.interactor.restoreCursorSpot()

    if (this.config.text) this.t.interactor.writeWithNewLine(this.config.text)
    this.config.options.forEach( (option, index) => {
      if (index == this.selected) {
        this.t.interactor.writeWithNewLine(
          this.t.interactor.color.green(
            this.t.interactor.decorate.bold(
              (this.config.back == option ? '<-- ' : '--> ') + option
            )
          )
        )
      } else {
        this.t.interactor.writeWithNewLine(
          '    ' + option
        )
      }
    })

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

    return {
      finished: reaction && reaction.action ? reaction.action() : false,
      rerender: !!reaction
    }
  } 

}