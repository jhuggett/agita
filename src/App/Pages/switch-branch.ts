import { AppPage, showGitCommandForSelectList } from ".";
import { App } from "../app";
import { Terminal } from "../../Terminal";
import { SelectList, SelectListResponse } from "../../Terminal/User Interactions/select-list";
import { PressEnterToContinue } from "../../Terminal/User Interactions/press-enter-to-continue";

interface Option {
  name: string
  function: { base?: string, addition?: string }
}

export class SwitchBranchPage implements AppPage {

  private ref = -1

  getRef() : number {
    return this.ref
  }

  setRef(ref: number) {
    this.ref = ref
  }

  branchOptions = []

  branchPickList =  new SelectList(this.t, {
    text: 'Pick branch:',
    options: [],
    back: 'Cancel',
    onChange: (response: SelectListResponse) => {
    }
  }) 

  setOptions(newOptions: Option[], forOptions: Option[], pickList: SelectList) {
    forOptions = newOptions
    pickList.config.options = [...newOptions.map( option => option.name ), pickList.config.back] 
    pickList.config.onChange = (response: SelectListResponse) => {
      showGitCommandForSelectList(response, forOptions, this.t, this.app)
    }
  }

  
  constructor (private app: App, private t: Terminal) {}

  async run() : Promise<AppPage | null> {
    this.t.interactor.clear()

    const branches = this.app.gitInfo.branchesWithCurrentFirst()
    branches[0] = branches[0] + ' (current)'

    this.setOptions(branches.map(branch => ({ name: branch, function: { base: `git checkout ${branch}`}})), this.branchOptions, this.branchPickList)


    const branchResponse = await this.branchPickList.run()

    this.t.interactor.clear()
    if (branchResponse.index == -1) {
      return null
    }

    const response = await this.app.gitCommand.execute()

    if (response.stderr) {
      this.t.interactor
      .clear()
      .write(response.stderr)

      await (new PressEnterToContinue(this.t)).run()
    }

    return null
  }
}