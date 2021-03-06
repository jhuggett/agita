import { PressEnterToContinue } from '../../Terminal/User Interactions/press-enter-to-continue'
import { AppPage } from "../../App/Pages"
import { App } from "../../App/app"
import { Terminal } from "../../Terminal"
import { Input } from '../../Terminal/User Interactions/input'
import { throws } from 'assert'



export class NewBranchPage implements AppPage {

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
    
    const response = await (new Input(this.t, { prompt: 'Name for new branch: ' })).run()
    
    if (response.input == '') {
      this.t.interactor
      .clear()
      .write(
        this.t.interactor.color.red(
          this.t.interactor.decorate.bold(
            'No name provided! So no branch was created.'
          )
        )
      ).newLine().newLine()

      await (new PressEnterToContinue(this.t)).run()
    } else {
      this.app.gitCommand.push({
        addition: ` ${response.input}`
      })
      await this.app.gitCommand.execute()
      this.app.gitCommand.clear()
    }

    return null
  }
}
