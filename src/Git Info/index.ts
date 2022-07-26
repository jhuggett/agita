import { existsSync, fstatSync, readdirSync, readFileSync, statSync } from 'fs'
import path = require('path')

type FileSystemNode = File | Directory

interface File {
  name: string
}

interface Directory extends File {
  children: FileSystemNode[]
}

const isDirectory = (node: FileSystemNode): node is Directory => (node as Directory).children !== undefined 

const recuseFileSystem = (currentPath: string[]) : FileSystemNode => {
  const resolvedPath = path.join(...currentPath)

  const info = statSync(resolvedPath)

  const name = currentPath[currentPath.length - 1]

  if (info.isDirectory()) {
    return {
      name,
      children: readdirSync(resolvedPath).map(node => recuseFileSystem([...currentPath, node]))
    }
  }

  return {
    name
  }
}

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
      
      let currentDir = recuseFileSystem([fullPath])
      
      if (!isDirectory(currentDir)) throw new Error("No Branches!")
      
      const getBranches = (node: FileSystemNode, prefixes: string[] = []): string[] => {
        if (!isDirectory(node)) {
          return [prefixes.join('/')]
        }
        let branches = []
        for (const child of node.children) {
          branches = [...branches, ...getBranches(child, [...prefixes, child.name])]
        }
        return branches
      }

      let branches: string[] = getBranches(currentDir)
      
      return branches
    } catch (error) {
      throw error
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
      return data.split('refs/heads/').pop().trim()
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