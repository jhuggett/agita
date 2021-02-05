import { UserInteractionView, UserInteractionResponse, ReactResponse, UserInteractionConfig } from "."
import { Terminal } from ".."

interface RequestConfirmationConfig extends UserInteractionConfig {
  question: string
}

interface RequestConfirmationResponse extends UserInteractionResponse {
  confirmed: boolean
}

export class RequestConfirmation implements UserInteractionView {

  options = [
    {
      selected: this.t.interactor.color.green(
                  this.t.interactor.decorate.underline(
                    this.t.interactor.decorate.bold(
                      'NO'
                    )
                  )
                ),
      unselected: 'n',
      value: false
    },
    {
      selected: this.t.interactor.color.green(
                  this.t.interactor.decorate.underline(
                    this.t.interactor.decorate.bold(
                      'YES'
                    )
                  )
                ),
      unselected: 'y',
      value: true
    }
  ]

  reactions: any = {
    3: {
      action: () => {
        process.exit()
      }
    },
    27: {
      91: {
        68: {
          action: () => {
            this.selected = this.selected - 1 < 0 ? this.options.length - 1 : this.selected - 1
            return false
          }
        },
        67: {
          action: () => {
            this.selected = this.selected + 1 >= this.options.length ? 0 : this.selected + 1
            return false
          }
        }
      }
    },
    13: {
      action: () => {
        return true
      }
    }
  }

  selected = 0

  config: RequestConfirmationConfig

  constructor(private t: Terminal, config: RequestConfirmationConfig, ) { this.config = config }

  async run() : Promise<RequestConfirmationResponse> {
    this.t.interactor.hideCaret()
    this.t.interactor.saveCursorSpot()

    let response: RequestConfirmationResponse | null = null
    let reactResponse: ReactResponse | null = null

    while (!response) {
      if (!reactResponse || reactResponse.rerender) this.render()
      reactResponse = await this.react()
      if (reactResponse.finished) {
        response = {
          confirmed: this.options[this.selected].value
        }
      }
    }

    return response
  }

  render() {
    this.t.interactor.restoreCursorSpot()

    this.t.interactor.clearLine()
    this.t.interactor.write(this.config.question)
    
    this.t.interactor.write(' (')
    this.options.forEach( (option, index) => {
      this.t.interactor.write(index == this.selected ? option.selected : option.unselected)
      if (index < this.options.length - 1) this.t.interactor.write('/')
    })
    this.t.interactor.write(')')
    
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