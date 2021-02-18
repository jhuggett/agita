import { AppPage, showGitCommandForSelectList } from ".";
import { App } from "../app";
import { Terminal } from "../../Terminal";
import { SelectList, SelectListResponse } from "../../Terminal/User Interactions/select-list";
import { StatusPage } from './status'
import { Input } from "../../Terminal/User Interactions/input";
import { AddMainPage } from "./Add";
import { NoGitFolderPage } from "./No Git Folder";
import { CommitPage } from './commit'
import { PushPage } from './push'
import { NewBranchPage } from "./new-branch";
import { SwitchBranchPage } from "./switch-branch";
import { SelectTree, SelectTreeBranch } from "../../Terminal/User Interactions/select-tree";
import { PullPage } from "./pull";
import { FetchPage } from "./fetch";

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
    },
    {
      name: 'Push',
      function: {
        base: 'git push'
      }
    },
    {
      name: 'Pull',
      function: {
        base: 'git pull'
      }
    },
    {
      name: 'New branch',
      function: {
        base: 'git checkout -b'
      }
    },
    {
      name: 'Switch branches',
      function: {
        base: 'git checkout'
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

    if (!this.app.gitInfo.gitFolderPath()) {
      return new NoGitFolderPage(this.app, this.t)
    }

    
    

    await this.app.gitCommand.useColor()

    this.t.interactor.clear()
    
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
        'Repository: '
      )
    )
    .write(this.app.gitInfo.gitFolderPath().split('/').splice(-2)[0])
    .newLine()
    .write(
      this.t.interactor.color.yellow(
        'Current branch: '
      )
    )
    .write(this.app.gitInfo.currentBranch())
    .newLine()
    .newLine()

    if (this.app.gitInfo.remotes().length == 0) {
      this.t.interactor
      .write(
        this.t.interactor.color.red(
          'No remote provided.'
        )
      )
      .newLine()
      .newLine()
    }
    
    const response = await this.pickList.run()

    switch (response.index) {
      case -1: {
        await this.app.gitCommand.disableColor()
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
      case 3: {
        return new PushPage(this.app, this.t)
      }
      case 4: {
        return new PullPage(this.app, this.t)
      }
      case 5: {
        return new NewBranchPage(this.app, this.t)
      }
      case 6: {
        return new SwitchBranchPage(this.app, this.t)
      }
    }

    return this
  }
}