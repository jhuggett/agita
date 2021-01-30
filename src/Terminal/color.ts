export default class Color {
  colors = {
      black: "\u001b[30m",
      red: "\u001b[31m",
      green: "\u001b[32m",
      yellow: "\u001b[33m",
      blue: "\u001b[34m",

      bgBlue: "\u001b[44m",
      bgGreen: "\u001b[42m",

      reset: "\u001b[0m"
  }


  red = (content: string) => {
      return this.colors.red + content + this.colors.reset
  }
  green = (content: string) => {
      return this.colors.green + content + this.colors.reset
  }
  yellow = (content: string) => {
      return this.colors.yellow + content + this.colors.reset
  }
  blue = (content: string) => {
      return this.colors.blue + content + this.colors.reset
  }

  bgBlue = (content: string) => {
      return this.colors.bgBlue + content + this.colors.reset
  }

  bgGreen = (content: string) => {
      return this.colors.bgGreen + content + this.colors.reset
  }


}