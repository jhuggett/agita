import { PressEnterToContinue } from '../../../Terminal/User Interactions/press-enter-to-continue'
import { AppPage, showGitCommandForSelectList } from ".."
import { App } from "../../app"
import { Terminal } from "../../../Terminal"
import { SelectList, SelectListResponse } from '../../../Terminal/User Interactions/select-list'
import { RequestConfirmation } from '../../../Terminal/User Interactions/request-confirmation'
import { SelectTreeBranch, SelectTree } from '../../../Terminal/User Interactions/select-tree'



export class SelectiveAddPage implements AppPage {

  private ref = -1

  getRef() : number {
    return this.ref
  }

  setRef(ref: number) {
    this.ref = ref
  }
  constructor (private app: App, private t: Terminal) {}

  tree: SelectTreeBranch = {
    name: 'All',
    open: true,
    selected: false,
  }

  findBranchByName(name: string, inBranches: SelectTreeBranch[]) : SelectTreeBranch | null {
    for (let branch of inBranches) {
      if (branch.name == name) return branch
    }
    return null
  }

  addBranch(branch: SelectTreeBranch, pathToBranch: string[]) {

    let currentBranch = this.tree

    for (let part of pathToBranch) {
      if (part == branch.name) { // hit final part, i.e. branch 
        if (!currentBranch.sub) currentBranch.sub = []
        branch.upperBranch = currentBranch
        currentBranch.sub.push(branch)
      }

      if (!currentBranch.sub) currentBranch.sub = []

      const branchForPart = this.findBranchByName(part, currentBranch.sub)
      if (!branchForPart) {
        currentBranch.sub.push({
          name: part,
          open: false,
          selected: false,
          upperBranch: currentBranch
        })
        currentBranch = this.findBranchByName(part, currentBranch.sub)
      } else {
        currentBranch = branchForPart
      }
    }

  }

  getPathForBranch(branch: SelectTreeBranch) : string {

    let currentBranch = branch
    let path = []

    while (currentBranch && currentBranch.name != 'All') {
      path.push(currentBranch.name)
      currentBranch = currentBranch.upperBranch
    }

    return path.reverse().join('/')
  }

  async run() : Promise<AppPage | null> {
    this.app.gitCommand.clear()
    await this.app.gitCommand.disableColor()
    
    const statusResponse = await this.app.gitCommand.push({base: 'git status -s'}).execute()
    
    let files = statusResponse.stdout.split(`\n`)

    for (let filePath of files) {
      if (filePath == '') continue
      const [staged, notStaged] = filePath
      let path = filePath.slice(3).split('/').map(part => part.trim()).map(piece => piece.split('').filter(char => char != '"').join(''))

      let selected = false

      if (staged != ' ' && staged != '?') { // already added
        selected = true
      }

      this.addBranch({
        name: path[path.length - 1],
        open: false,
        selected: selected,
      }, path)
    }

    await this.app.gitCommand.useColor()

    this.t.interactor
    .clear()
    
    
    const response = await (new SelectTree(this.t, { tree: this.tree })).run()

    this.t.interactor.clear()


    const pathsToAdd = response.selectedItems.map(item => this.getPathForBranch(item))

    const pathsToReset = response.unselectedItems.map(item => this.getPathForBranch(item))

    for (let path of pathsToAdd) {
      await this.app.gitCommand.clear()
      .push({ base: `git add "${path}"` })
      .execute()
    }

    for (let path of pathsToReset) {
      await this.app.gitCommand.clear()
      .push({ base: `git reset "${path}"` })
      .execute()
    }
    

    return null
  }
}
