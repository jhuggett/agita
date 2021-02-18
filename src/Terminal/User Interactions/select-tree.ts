import { UserInteractionView, UserInteractionResponse, ReactResponse, UserInteractionConfig } from "."
import { Terminal } from ".."

export interface SelectTreeBranch { 
  upperBranch?: SelectTreeBranch
  name: string
  sub?: SelectTreeBranch[]
  open: boolean
  selected: boolean
}

interface SelectTreeConfig extends UserInteractionConfig {
  tree: SelectTreeBranch

}

export interface SelectTreeResponse extends UserInteractionResponse {
  selectedItems: SelectTreeBranch[]
  unselectedItems: SelectTreeBranch[]

}

interface CurrentBranch {
  branch?: SelectTreeBranch
  line: number
}

export class SelectTree implements UserInteractionView {
  config: SelectTreeConfig

  reactions: any = {
    3: {
      action: () => { process.exit() }
    },
    27: {
      91: {
        65: { // up
          action: () => {
            this.current.line = this.current.line - 1 < 0 ? this.visibleBranches.length - 1 : this.current.line - 1
              this.current.branch = this.visibleBranches[this.current.line]
            
            return false
          }
        },
        66: { // down 
          action: () => {
              if (this.current.line == -1) {
                this.current.line = 0
                this.current.branch = this.visibleBranches[this.current.line]
              } else {
                this.current.line = this.current.line + 1 > this.visibleBranches.length - 1 ? -1 : this.current.line + 1
                this.current.branch = this.visibleBranches[this.current.line]
              }
              
            
              return false
          }
        },
        67: { // right
          action: () => {
            if (this.current.branch.selected && this.current.branch.sub) return false
            this.current.branch.open = !this.current.branch.open
            // if (this.current.branch.sub && this.current.branch.open) {
            //   this.current.branch = this.current.branch.sub[0]
            //   this.numberOfLines(this.config.tree)
            //   this.current.line = this.getLineForBranch(this.current.branch)
            // }

            return false
          }
        },
        68: { // left
          action: () => {
            if (this.current.branch.upperBranch) {
              this.current.branch = this.current.branch.upperBranch
              this.current.line = this.getLineForBranch(this.current.branch)
              //this.current.branch.open = false
            }
            
            
            return false
            
          }
        }

      }
    },
    13: { // enter
      action: () => {
        if (this.current.line == -1) return true

        if (this.current.branch.selected) {
          this.setSelectAllForBranch(this.current.branch, false)

          let upperBranch = this.current.branch.upperBranch

          while (upperBranch) {
            upperBranch.selected = false
            upperBranch = upperBranch.upperBranch
          }
          
        } else {
          this.setSelectAllForBranch(this.current.branch, true)
          if (this.current.branch.sub && this.current.branch.open) {
            this.current.branch.open = false
          }
        }
        
        return false
      }
    }
  }

  setSelectAllForBranch(branch: SelectTreeBranch, shouldSelect: boolean) {
    branch.selected = shouldSelect
    if (branch.sub) {
      for (let subBranch of branch.sub) {
        this.setSelectAllForBranch(subBranch, shouldSelect)
      }
    }
  }


  initialSelected: SelectTreeBranch[]

  constructor(private t: Terminal, config: SelectTreeConfig) { this.config = config; this.current.branch = this.config.tree
    this.initialSelected = this.getAllSelectedEndBranches(this.config.tree)
  }

  current: CurrentBranch = {
    line: 0,
    branch: null
  }

  

  async run() : Promise<SelectTreeResponse> {
    this.t.interactor.hideCaret()
    this.t.interactor.saveCursorSpot()
    .clear()

    let response: SelectTreeResponse | null = null
    let reactResponse: ReactResponse | null = null

    while(!response) {
      if (!reactResponse || reactResponse.rerender) this.render()
      reactResponse = await this.react()

      if (reactResponse.finished) { // NEED TO FIGURE OUT WHAT TO RETURN
        let selected: SelectTreeBranch[] = []
        let unselected: SelectTreeBranch[] = []
        
        
        const currentSelected = this.getAllSelectedEndBranches(this.config.tree)

        for (let selectedBranch of currentSelected) {
          if (!this.initialSelected.includes(selectedBranch)) {
            selected.push(selectedBranch)
          }
        }

        for (let initiallySelectedBranch of this.initialSelected) {
          if (!currentSelected.includes(initiallySelectedBranch)) {
            unselected.push(initiallySelectedBranch)
          }
        }
        
        response = {
          selectedItems: selected,
          unselectedItems: unselected
        }
      }
    }
    

    return response
  }

  visibleBranches: SelectTreeBranch[] = []

  numberOfLines(branch: SelectTreeBranch) : number {
    this.visibleBranches.push(branch)
    if (branch.open && branch.sub) {
      let count = 0
      for (let subBranch of branch.sub) {
        count += this.numberOfLines(subBranch)
      }
      return count
    } else {
      return 1
    }
  }

  getLineForBranch(branch: SelectTreeBranch) : number {
    for (let [index, value] of this.visibleBranches.entries()) {
      if (value == branch) {
        return index
      }
    }
    return 0
  }

  getAllSelectedEndBranches(branch: SelectTreeBranch) : SelectTreeBranch[] {
    if (branch.sub) {
      let branches: SelectTreeBranch[] = []
      for (let subBranch of branch.sub) {
        const selectedBranches = this.getAllSelectedEndBranches(subBranch)
        for (let selectedBranch of selectedBranches) {
          branches.push(selectedBranch)
        }
      }
      return branches
    } else {
      if (branch.selected) {
        return [branch]
      }
      return []
    }
  }

  renderBranch(branch: SelectTreeBranch, depth: number) {

    if (branch == this.current.branch) {
      if (branch.selected) {
        this.t.interactor
        .write(
          this.t.interactor.color.red(
            'REMOVE > '
          )
        )
        .write(
          ' '.repeat(depth)
        )
        .write(
          this.t.interactor.color.red(
            (branch.open && branch.sub ? '-' : branch.sub ? '+' : ' ') + ' ' + branch.name
          )
        )
      } else {
        this.t.interactor
        .write(
          this.t.interactor.color.yellow(
            'ADD    > '
          )
        )
        .write(
          ' '.repeat(depth)
        )
        .write(
          this.t.interactor.color.yellow(
            (branch.open && branch.sub ? '-' : branch.sub ? '+' : ' ') + ' ' + branch.name
          )
        )
      }
    } else if (branch.selected) {
      this.t.interactor
        .write(
          this.t.interactor.color.green(
            'ADDED    '
          )
        )
        .write(
          ' '.repeat(depth)
        )
        .write(
          this.t.interactor.color.green(
            (branch.open && branch.sub ? '-' : branch.sub ? '+' : ' ') + ' ' + branch.name
          )
        )
    } else {
      this.t.interactor
        .write(
        
            '         '
          
        )
        .write(
          ' '.repeat(depth)
        )
        .write(
          
            (branch.open && branch.sub ? '-' : branch.sub ? '+' : ' ') + ' ' + branch.name
          
        )
    }
    this.t.interactor.newLine()

    if (branch.open && branch.sub) {
      for (let subBranch of branch.sub) {
        this.renderBranch(subBranch, depth + 1)
      }
    }
  }

  render() {

    this.t.interactor.restoreCursorSpot()
    .clear()
    this.visibleBranches = []
    
    this.numberOfLines(this.config.tree)
    this.t.interactor
    .write(
      this.t.interactor.color.green(
        'Selectively add or remove file from git.'
      )
    ).newLine()
    
    
    this.renderBranch(this.config.tree, 0)

    this.t.interactor
    .newLine()
    if (this.current.line == -1) {
      this.t.interactor
      .write(
        this.t.interactor.color.yellow(
          '       > Done'
        )
      )
    } else {
      this.t.interactor
      .write(
          '         Done'
        
      )
    }
  }

  async react() : Promise<ReactResponse> {
    const key = await this.t.interactor.reactToKeyPress()
    
    let level = 0
    let reaction = this.reactions
    while (reaction && !reaction.action) {
      if (key[level]) {
        reaction = reaction[key[level]]
        level++
      } else break
    }

    return {
      finished: reaction && reaction.action ? reaction.action() : false,
      rerender: !!reaction
    }
  } 

}