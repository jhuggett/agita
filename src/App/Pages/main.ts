import { AppPage, showGitCommandForSelectList } from ".";
import { App } from "../app";
import { Terminal } from "../../Terminal";
import { SelectList, SelectListResponse } from "../../Terminal/User Interactions/select-list";
import { StatusPage } from './status'
import { Input } from "../../Terminal/User Interactions/input";
import { AddMainPage } from "./Add";
import { NoGitFolderPage } from "./No Git Folder";
import { CommitPage } from './commit'

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
    },
    {
      name: 'Add',
      function: {
        base: 'git add'
      }
    },
    {
      name: 'Commit',
      function: {
        base: 'git commit -m'
      }
    }
  ]

  pickList = new SelectList(this.t, {
    text: 'Main:',
    options: this.options.map(item => item.name),
    back: 'Quit',
    onChange: (response: SelectListResponse) => {
      showGitCommandForSelectList(response, this.options, this.t, this.app)
    }
  }) 
  
  constructor (private app: App, private t: Terminal) {}

  async run() : Promise<AppPage | null> {

    if (!this.app.gitInfo.gitFolderPresent()) {
      return new NoGitFolderPage(this.app, this.t)
    }

    await this.app.gitCommand.alwaysUseColor()
    
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
      this.t.interactor.color.yellow(
        'Loaded: ' + this.app.gitInfo.currentDirectory()
      )
    )
    .newLine()
    .newLine()
    
    const response = await this.pickList.run()

    switch (response.index) {
      case -1: {
        return null
      }
      case 0: {
        return new StatusPage(this.app, this.t)
      }
      case 1: {
        return new AddMainPage(this.app, this.t)
      }
      case 2: {
        return new CommitPage(this.app, this.t)
      }
    }

    return this
  }
}