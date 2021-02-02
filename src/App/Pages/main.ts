import { AppPage } from ".";
import { App } from "../app";
import { Terminal } from "../../Terminal";
import { SelectList, SelectListResponse } from "../../Terminal/User Interactions/select-list";
import { StatusPage } from './status'

export class MainPage implements AppPage {

  private ref = -1

  getRef() : number {
    return this.ref
  }

  setRef(ref: number) {
    this.ref = ref
  }


  options = [
    {
      name: 'Status',
      function: {
        base: 'git status'
      }
    }
  ]

  pickList = new SelectList(this.t, {
    text: 'Main:',
    options: this.options.map(item => item.name),
    back: 'Quit',
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
  
  constructor (private app: App, private t: Terminal) {}

  async run() : Promise<AppPage | null> {

    this.t.interactor
    .clear()
    .write(
      'Welcome to ' +
      this.t.interactor.color.blue(
        this.t.interactor.decorate.bold(
          'AGITA'
        )
      )
    )
    .newLine()
    .newLine()
    .write(
      'Loaded: ' + this.app.gitInfo.currentDirectory()
    )
    .newLine()
    .newLine()
    

    if (!this.app.gitInfo.gitFolderPresent()) {
      console.log('No .git folder present!');
      console.log();

      // route to page for getting started with git
      
    }


    const response = await this.pickList.run()

    switch (response.index) {
      case -1: {
        return null
      }
      case 0: {
        return new StatusPage(this.app, this.t)
      }
    }

    return this
  }
}