import { exec } from "child_process"

export interface GitCommandExecutionResult {
  stdout: string
  stderr?: string
}

export interface GitCommandInfo {
  base?: string
  addition?: string
}

export class GitCommand {
  

  private commandSections: string[] = []

  command() : string {
    return this.commandSections.join('')
  }

  clear() : GitCommand {
    this.commandSections = []

    return this
  }

  push(info: GitCommandInfo) : GitCommand {
    if (info.base) {
      this.clear()
      .commandSections.push(info.base)
    }
    if (info.addition) {
      this.commandSections.push(info.addition)
    }
    return this
  }

  pop() : GitCommand {
    this.commandSections
    return this
  }

  async alwaysUseColor() {
    await this.push({ base: 'git config color.ui always --replace-all' }).execute()
    this.clear()
  }

  async execute() : Promise<GitCommandExecutionResult> {
    return new Promise((resolve, reject) => {
      exec(this.command(), (error, stdout, stderr) => {
        if (error) console.warn(error)
        resolve({
          stdout,
          stderr
        })
      })
    })
  }

}