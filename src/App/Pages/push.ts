import { AppPage, showGitCommandForSelectList } from ".";
import { App } from "../app";
import { Terminal } from "../../Terminal";
import { SelectList, SelectListResponse } from "../../Terminal/User Interactions/select-list";
import { StatusPage } from './status'
import { Input } from "../../Terminal/User Interactions/input";
import { AddMainPage } from "./Add";
import { NoGitFolderPage } from "./No Git Folder";
import { CommitPage } from './commit'
import { PressEnterToContinue } from "../../Terminal/User Interactions/press-enter-to-continue";

interface Option {
  name: string
  function: { base?: string, addition?: string }
}

export class PushPage implements AppPage {

  private ref = -1

  getRef() : number {
    return this.ref
  }

  setRef(ref: number) {
    this.ref = ref
  }


  remoteOptions = []
  branchOptions = []

  remotePickList = new SelectList(this.t, {
    text: 'Pick remote:',
    options: [],
    back: 'Cancel',
    onChange: (response: SelectListResponse) => {
      showGitCommandForSelectList(response, this.remoteOptions, this.t, this.app)
    }
  }) 

  branchPickList =  new SelectList(this.t, {
    text: 'Pick branch:',
    options: [],
    back: 'Back',
    onChange: (response: SelectListResponse) => {
      showGitCommandForSelectList(response, this.branchOptions, this.t, this.app)
    }
  }) 

  setOptions( newOptions: Option[], forOptions: Option[], pickList: SelectList) {
    forOptions = newOptions
    pickList.config.options = [...newOptions.map( option => option.name ), pickList.config.back] 
  }

  
  constructor (private app: App, private t: Terminal) {}

  async run() : Promise<AppPage | null> {

    const remotes: string[] = this.app.gitInfo.remotes()


    if (remotes.length == 0) {
      // should return page to set remote
      return null
    }

    this.setOptions(remotes.map(remote => ({ name: remote, function: { base: `git push ${remote}`}})), this.remoteOptions, this.remotePickList)
    

    this.t.interactor.clear()

    const remoteResponse = await this.remotePickList.run()

    if (remoteResponse.index == -1) {
      return null
    } else {
      const branches = this.app.gitInfo.branchesWithCurrentFirst()

      this.setOptions(branches.map(branch => ({ name: branch, function: { base: `git push ${remoteResponse.selectedItem} ${branch}`}})), this.branchOptions, this.branchPickList)

      this.t.interactor.clear()

      const branchResponse = await this.branchPickList.run()

      if (branchResponse.index == -1) {
        return this // goes back to picking remote
      }

      const commandData = await this.app.gitCommand.execute()

      this.t.interactor.clear()
      .write(commandData.stdout)

      await (new PressEnterToContinue(this.t)).run()
    }
  }
}