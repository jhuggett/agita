import { existsSync, readdirSync, readFileSync } from 'fs'



export class GitInfo {

  currentDirectory() : string {
    return process.cwd()
  }

  private pathToGitFolder: string | null = null

  gitFolderPath() : string | null {
    if (this.pathToGitFolder) return this.pathToGitFolder

    const pathSteps = this.currentDirectory().split('/')

    while (pathSteps.length > 0) {
      const path = pathSteps.join('/') + '/.git'
      if (existsSync(path)) {
        this.pathToGitFolder = path
        return path
      }
      pathSteps.pop()
    }

    return
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