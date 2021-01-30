
export default class Decorate {
  decorations = {
      bold: "\u001b[1m",
      underline: "\u001b[4m",
      reversed: "\u001b[7m",

      reset: "\u001b[0m"
  }

  bold = (content: string) => {
      return this.decorations.bold + content + this.decorations.reset
  }
  underline = (content: string) => {
      return this.decorations.underline + content + this.decorations.reset
  }
  reversed = (content: string) => {
      return this.decorations.reversed + content + this.decorations.reset
  }
}