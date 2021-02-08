import { existsSync, readdirSync, readFileSync } from 'fs'



export class GitInfo {

  currentDirectory() : string {
    return process.cwd()
  }

  gitFolderPresent() : boolean {
    return existsSync(this.gitFolderPath())
  }

  gitFolderPath() : string {
    return `${this.currentDirectory()}/.git`
  }

  gitFolderPathWithSlash() : string {
    return this.gitFolderPath() + '/'
  }


  branches() : string[] {
    try {
      return readdirSync(this.gitFolderPathWithSlash() + 'refs/heads/', { withFileTypes: true })
      .map( file => file.name )
    } catch (error) {
      return []
    }
  }

  branchesWithCurrentFirst() : string[] {
    const currentBranch = this.currentBranch() || ''
    const branches = this.branches().filter(branch => branch != currentBranch)

    return [currentBranch, ...branches]
  }

  currentBranch() : string | null {
    try {
      const data = readFileSync(this.gitFolderPathWithSlash() + 'HEAD', 'utf8')

      return data.split('/').pop().trim()
    } catch (error) {
      
      return null // no found
    }
  }

  remotes() : string[] {
    try {
      return readdirSync(this.gitFolderPathWithSlash() + 'refs/remotes/', { withFileTypes: true })
      .filter( file => file.isDirectory() )
      .map( dir => dir.name )
    } catch (error) {
      return []
    }
  }
}