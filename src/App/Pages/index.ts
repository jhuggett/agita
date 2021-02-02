import { Terminal } from "../../Terminal";
import { App } from "../app";


export interface AppPage {
  setRef: (ref: number) => void
  getRef: () => number
  run: () => Promise<AppPage | null>
}
