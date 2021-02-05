import { PressEnterToContinue } from '../../../Terminal/User Interactions/press-enter-to-continue'
import { AppPage } from ".."
import { App } from "../../app"
import { Terminal } from "../../../Terminal"
import { SelectList, SelectListResponse } from '../../../Terminal/User Interactions/select-list'
import { RequestConfirmation } from '../../../Terminal/User Interactions/request-confirmation'



export class AddMainPage implements AppPage {

  private ref = -1

  getRef() : number {
    return this.ref
  }

  setRef(ref: number) {
    this.ref = ref
  }
  constructor (private app: App, private t: Terminal) {}

  options = [
    {
      name: 'Add all',
      function: {
        base: 'git add .'
      }
    }
  ]

  pickList = new SelectList(this.t, {
    text: 'Add:',
    options: this.options.map(item => item.name),
    back: 'Cancel',
    onChange: (response: SelectListResponse) => {
      const option = this.options[response.index]
      if (this.options[response.index]) {
        this.app.gitCommand.push(option.function)
      }

      if (option) {
        this.t.interactor
        .moveCursorToBottom()
        .clearLine()
        .write('>>> ' + this.app.gitCommand.command())
        .moveCursor.moveTo(0, 0)
      } else {
        this.t.interactor
        .moveCursorToBottom()
        .clearLine()
        .moveCursor.moveTo(0, 0)
      }

      
    }
  }) 

  async run() : Promise<AppPage | null> {

    this.t.interactor
    .clear()
    

    const response = await this.pickList.run()

    switch (response.index) {
      case -1: {
        return null
      }
      case 0: {
        this.t.interactor.clear()
        if ((await (new RequestConfirmation(this.t, { question: 'Are you sure you want to add everything?'}).run())).confirmed) {
          await this.app.gitCommand.execute()
          return null
        }
        return this
      }
    }

    return null
  }
}
