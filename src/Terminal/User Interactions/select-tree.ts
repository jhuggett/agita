import { UserInteractionView, UserInteractionResponse, ReactResponse, UserInteractionConfig } from "."
import { Terminal } from ".."

export interface SelectTreeBranch { 
  name: string
  sub?: SelectTreeBranch[]
}

interface SelectTreeConfig extends UserInteractionConfig {
  tree: SelectTreeBranch[]

}

export interface SelectTreeResponse extends UserInteractionResponse {


}

export class SelectTree implements UserInteractionView {
  config: SelectTreeConfig

  reactions: any = {
  }

  constructor(private t: Terminal, config: SelectTreeConfig) { this.config = config }


  selected = 0

  async run() : Promise<SelectTreeResponse> {
    this.t.interactor.hideCaret()
    this.t.interactor.saveCursorSpot()

    let response: SelectTreeResponse | null = null
    let reactResponse: ReactResponse | null = null

    while(!response) {
      if (!reactResponse || reactResponse.rerender) this.render()
      reactResponse = await this.react()

      if (reactResponse.finished) {
        response = {

        }
      }
    }

    return response
  }

  render() {

    this.t.interactor.restoreCursorSpot()

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