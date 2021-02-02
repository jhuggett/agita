import { PressEnterToContinue } from '../../Terminal/User Interactions/press-enter-to-continue'
import { AppPage } from "../../App/Pages"
import { App } from "../../App/app"
import { Terminal } from "../../Terminal"



export class StatusPage implements AppPage {

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
    .write(
      this.t.interactor.color.yellow(
        'Status: '
      )
    )
    .newLine()
    .newLine()

    const response = await this.app.gitCommand.execute()

    console.log(response.stdout);
    

    
    await (new PressEnterToContinue(this.t)).run()

    return null
  }
}
