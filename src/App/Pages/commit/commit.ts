import { PressEnterToContinue } from '../../../Terminal/User Interactions/press-enter-to-continue'
import { AppPage } from ".."
import { App } from "../../app"
import { Terminal } from "../../../Terminal"
import { Input } from '../../../Terminal/User Interactions/input'
import { throws } from 'assert'



export class CommitPage implements AppPage {

  private ref = -1

  getRef() : number {
    return this.ref
  }

  setRef(ref: number) {
    this.ref = ref
  }
  constructor (private app: App, private t: Terminal) {}

  async run() : Promise<AppPage | null> {

    this.t.interactor
    .clear()
    
    const response = await (new Input(this.t, { prompt: 'Commit message: ' })).run()
    
    if (response.input == '') {
      this.t.interactor
      .clear()
      .write(
        this.t.interactor.color.red(
          this.t.interactor.decorate.bold(
            'No message provided! So the commit didn\'t go through.'
          )
        )
      ).newLine().newLine()

      await (new PressEnterToContinue(this.t)).run()
    } else {
      this.app.gitCommand.push({
        addition: `${response.input}'`
      })
      await this.app.gitCommand.execute()
      this.app.gitCommand.clear()
    }

    return null
  }
}
