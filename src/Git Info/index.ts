import { existsSync } from 'fs'



export class GitInfo {

  currentDirectory() : string {
    return process.cwd()
  }

  gitFolderPresent() : boolean {
    return existsSync(`${this.currentDirectory()}/.git`)
  }
}