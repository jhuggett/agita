import { PressEnterToContinue } from "../../../Terminal/User Interactions/press-enter-to-continue";
import { AppPage, showGitCommandForSelectList } from "..";
import { App } from "../../app";
import { Terminal } from "../../../Terminal";
import {
  SelectList,
  SelectListResponse,
} from "../../../Terminal/User Interactions/select-list";
import { RequestConfirmation } from "../../../Terminal/User Interactions/request-confirmation";

export class NoGitFolderPage implements AppPage {
  private ref = -1;

  getRef(): number {
    return this.ref;
  }

  setRef(ref: number) {
    this.ref = ref;
  }
  constructor(private app: App, private t: Terminal) {}

  options = [
    {
      name: "Initialize new repository",
      function: {
        base: "git init",
      },
    },
  ];

  pickList = new SelectList(this.t, {
    text: "Getting started:",
    options: this.options.map((item) => item.name),
    back: "Quit",
    onChange: (response) => {
      response &&
        showGitCommandForSelectList(response, this.options, this.t, this.app);
    },
  });

  async run(): Promise<AppPage | null> {
    this.t.interactor
      .clear()
      .write(
        "Welcome to " +
          this.t.interactor.color.blue(this.t.interactor.decorate.bold("AGITA"))
      )
      .newLine()
      .newLine()
      .write(
        this.t.interactor.color.red(
          this.t.interactor.decorate.bold("No .git folder present!")
        )
      )
      .newLine()
      .newLine();

    const response = await this.pickList.run();

    switch (response.index) {
      case -1: {
        this.app.popPage();
        this.app.popPage();
        // this will cause the program to complete, should write a proper function for this me thinks
        return null;
      }
      case 0: {
        await this.app.gitCommand.execute();
        return null;
      }
    }

    return null;
  }
}
