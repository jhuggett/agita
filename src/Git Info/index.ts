import { existsSync, readdirSync, readFileSync } from 'fs'
import path = require('path')


export class GitInfo {

  currentDirectory() : string {
    return process.cwd()
  }

  private pathToGitFolder: string | null = null

  gitFolderPath() : string | null {
    if (this.pathToGitFolder) return this.pathToGitFolder

    let current = path.parse(this.currentDirectory())
    while (current.dir && current.dir != current.root) {
      const testPath = path.join(current.dir, current.base, ".git")
      if (existsSync(testPath)) {
        this.pathToGitFolder = testPath
        return testPath
      }
    }
  }

  branches() : string[] {
    
    try {
      const fullPath = path.join(this.gitFolderPath(), "refs", "heads")
      return readdirSync(fullPath)
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
      const fullPath = path.join(this.gitFolderPath(), "HEAD")
      const data = readFileSync(fullPath, 'utf8')
      return data.split('/').pop().trim()
    } catch (error) {
      return null // not found
    }
  }

  remotes() : string[] {
    try {
      const fullPath = path.join(this.gitFolderPath(), "refs", "remotes")
      return readdirSync(fullPath)
    } catch (error) {
      return []
    }
  }
}