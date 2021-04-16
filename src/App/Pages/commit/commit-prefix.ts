
import { SelectList, SelectListResponse } from '../../../Terminal/User Interactions/select-list'
import { showGitCommandForSelectList, AppPage } from '..'
import { App } from '../../app'
import { Terminal } from '../../../Terminal'
import { PressEnterToContinue } from '../../../Terminal/User Interactions/press-enter-to-continue'
import { CommitPage } from './commit'



export class CommitPrefixPage implements AppPage {

  private ref = -1

  options = [
    {
      name: 'feature',
      function: {
        base: 'git commit -m \'feat: '
      }
    },
    {
      name: 'bug fix',
      function: {
        base: 'git commit -m \'fix: '
      }
    },
    {
      name: 'documentation',
      function: {
        base: 'git commit -m \'docs: '
      }
    },
    {
      name: 'style',
      function: {
        base: 'git commit -m \'style: '
      }
    },
    {
      name: 'refactoring',
      function: {
        base: 'git commit -m \'refactor: '
      }
    },
    {
      name: 'performance improvement',
      function: {
        base: 'git commit -m \'perf: '
      }
    },
    {
      name: 'tests',
      function: {
        base: 'git commit -m \'test: '
      }
    },
    {
      name: 'builds',
      function: {
        base: 'git commit -m \'build: '
      }
    },
    {
      name: 'continuous integrations',
      function: {
        base: 'git commit -m \'ci: '
      }
    },
    {
      name: 'chore',
      function: {
        base: 'git commit -m \'chore: '
      }
    },
    {
      name: 'revert',
      function: {
        base: 'git commit -m \'revert: '
      }
    },
    {
      name: 'none',
      function: {
        base: 'git commit -m \''
      }
    }
  ]

  pickList = new SelectList(this.t, {
    text: 'Commit Prefix:',
    options: this.options.map(item => item.name),
    back: 'Cancel',
    onChange: (response: SelectListResponse) => {
      showGitCommandForSelectList(response, this.options, this.t, this.app)
    }
  }) 

  getRef() : number {
    return this.ref
  }

  setRef(ref: number) {
    this.ref = ref
  }
  constructor (private app: App, private t: Terminal) {}

  async run() : Promise<AppPage | null> {

    this.t.interactor.clear()
    
    const response = await this.pickList.run()

    if (response.index == -1) {
      return null
    }

    this.app.gitCommand.push(this.options[response.index].function)

    return new CommitPage(this.app, this.t)
  }
}