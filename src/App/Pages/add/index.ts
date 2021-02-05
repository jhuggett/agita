import { PressEnterToContinue } from '../../../Terminal/User Interactions/press-enter-to-continue'
import { AppPage, showGitCommandForSelectList } from ".."
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
      showGitCommandForSelectList(response, this.options, this.t, this.app)
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
