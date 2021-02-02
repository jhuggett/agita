import { GitCommand } from './git-command'
import { AppPage } from './Pages'

export class App {

  private pageStack: AppPage[] = []

  gitCommand: GitCommand = new GitCommand()


  currentPage() : AppPage | null {
    return this.pageStack[this.pageStack.length - 1]
  }

  pushPage(page: AppPage) : AppPage | null {
    page.setRef(this.pageStack.length)
    this.pageStack.push(page)
    return this.currentPage()
  }

  popPage() : AppPage {
    this.pageStack.pop()
    return this.currentPage()
  }

  async run() {
    while (this.currentPage()) {
      const page = this.currentPage()
      const pageResponse = await page.run()
      if (pageResponse) {
        if (pageResponse.getRef() != page.getRef()) {
          this.pushPage(pageResponse)
        }
      } else {
        this.popPage()
      }
    }
  }
}