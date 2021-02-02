import { UserInteractionView, UserInteractionResponse, ReactResponse, UserInteractionConfig } from "."
import { Terminal } from ".."



export class PressEnterToContinue implements UserInteractionView {

  config: UserInteractionConfig = {}

  constructor(private t: Terminal) {}

  reactions: any = {
    13: {
      action: () => {
        return true
      }
    }
  }


  async run() : Promise<UserInteractionResponse> {

    this.t.interactor.hideCaret()
    this.t.interactor.saveCursorSpot()

    let response: UserInteractionResponse | null = null
    let reactResponse: ReactResponse | null = null

    while (!response) {
      if (!reactResponse || reactResponse.rerender) this.render()
      reactResponse = await this.react()
      
      if (reactResponse.finished) response = {}
    }

    return response
  }

  render() {
    this.t.interactor.writeOnNewLine(
      this.t.interactor.color.green(
        this.t.interactor.decorate.bold(
          'Press enter to continue'
        )
      )
    )
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

