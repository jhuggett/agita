import { Terminal } from "../../Terminal";
import { App } from "../app";
import { SelectListResponse } from "../../Terminal/User Interactions/select-list";


export interface AppPage {
  setRef: (ref: number) => void
  getRef: () => number
  run: () => Promise<AppPage | null>
}

export function showGitCommandForSelectList(response: SelectListResponse, options, t: Terminal, app: App) {
  const option = options[response.index]
      if (options[response.index]) {
        app.gitCommand.push(option.function)
      }

      if (option) {
        t.interactor
        .moveCursorToBottom()
        .clearLine()
        .write('>>> ' + app.gitCommand.command())
        .moveCursor.moveTo(0, 0)
      } else {
        t.interactor
        .moveCursorToBottom()
        .clearLine()
        .moveCursor.moveTo(0, 0)
      }

      
}