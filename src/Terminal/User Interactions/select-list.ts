import {
  UserInteractionView,
  UserInteractionResponse,
  ReactResponse,
  UserInteractionConfig,
} from ".";
import { Terminal } from "..";

interface SelectListConfig extends UserInteractionConfig {
  text?: string;
  options: string[];
  back?: string;

  onChange?: (response: SelectListResponse | null) => void;
}

export interface SelectListResponse extends UserInteractionResponse {
  selectedItem: string;
  index: number;
}

export class SelectList implements UserInteractionView {
  config: SelectListConfig;

  get options(): { option: string; index: number }[] {
    return this.config.options
      .map((option, index) => ({
        option,
        index,
      }))
      .filter(({ option }) =>
        option.toLowerCase().startsWith(this.search.toLowerCase())
      );
  }

  reactions: any = {
    3: {
      action: () => {
        process.exit();
      },
    },
    27: {
      91: {
        65: {
          // up
          action: () => {
            this.selected =
              this.selected - 1 < 0
                ? this.options.length - 1
                : this.selected - 1;
            return false;
          },
        },
        66: {
          // down
          action: () => {
            this.selected =
              this.selected + 1 > this.options.length - 1
                ? 0
                : this.selected + 1;
            return false;
          },
        },
        67: {
          // right
          action: () => {
            return true;
          },
        },
        68: {
          // left
          action: () => {
            if (this.config.back) {
              this.selected = -1;
              return true;
            }
          },
        },
      },
    },
    13: {
      // enter
      action: () => {
        return true;
      },
    },
    127: {
      // delete
      action: () => {
        this.removeFromSearch();
        return false;
      },
    },
    8: {
      // backspace, windows doesn't recognize 127 it seems ¯\_(ツ)_/¯
      action: () => {
        this.removeFromSearch();
        return false;
      },
    },
    32: {
      // space
      action: () => {
        this.addToSearch(" ");
        return false;
      },
    },
  };

  constructor(private t: Terminal, config: SelectListConfig) {
    this.config = config;
    if (this.config.back) this.config.options.push(this.config.back);
  }

  selected = 0;

  private get currentItem() {
    if (this.selected !== -1 && this.options.length === 0) return null;
    return {
      selectedItem:
        this.config.back && this.selected === -1
          ? this.config.back
          : this.options[this.selected].option,
      index:
        this.config.back &&
        (this.selected == -1 ||
          this.options[this.selected].option === this.config.back)
          ? -1
          : this.options[this.selected].index,
    };
  }

  async run(): Promise<SelectListResponse> {
    this.t.interactor.hideCaret();
    this.t.interactor.saveCursorSpot();

    if (this.config.onChange) {
      // initial call of onChange
      // why is there
      this.config.onChange(this.currentItem);
    }

    let response: SelectListResponse | null = null;
    let reactResponse: ReactResponse | null = null;

    while (!response) {
      if (!reactResponse || reactResponse.rerender) this.render();
      reactResponse = await this.react();

      if (reactResponse.rerender && this.config.onChange) {
        this.config.onChange(this.currentItem);
      }

      if (reactResponse.finished) {
        response = this.currentItem;
      }
    }

    return response;
  }

  render() {
    this.t.interactor.restoreCursorSpot();

    if (this.config.text) this.t.interactor.clearLine();
    this.t.interactor.writeWithNewLine(
      this.config.text + (this.search ? ` (${this.search})` : "")
    );

    for (const _ of this.config.options) {
      this.t.interactor.clearLine().newLine();
    }

    this.t.interactor.moveCursor.up(this.config.options.length);

    this.options.forEach(({ option }, index) => {
      if (index == this.selected) {
        this.t.interactor
          .clearLine()
          .write(
            this.t.interactor.color.green(
              this.t.interactor.decorate.bold(
                (this.config.back == option ? "<- " : "-> ") + option
              )
            )
          )
          .newLine();
      } else {
        this.t.interactor
          .clearLine()
          .write("   " + option)
          .newLine();
      }
    });
  }

  removeFromSearch() {
    this.search = this.search.slice(0, -1);
    this.selected = 0;
  }
  addToSearch(char: string) {
    this.search += char;
    this.selected = 0;
    // this.selected = this.config.options.findIndex((option) =>
    //   option.startsWith(this.search)
    // );
  }

  search = "";

  async react(): Promise<ReactResponse> {
    const key = await this.t.interactor.reactToKeyPress();

    let level = 0;
    let reaction = this.reactions;
    while (reaction && !reaction.action) {
      if (key[level]) {
        reaction = reaction[key[level]];
        level++;
      } else break;
    }

    if (!reaction) {
      if (key[0] > 32 && key[0] < 127) {
        this.addToSearch(key.toString());
      }
    }

    return {
      finished: reaction && reaction.action ? reaction.action() : false,
      rerender: true,
    };
  }
}
