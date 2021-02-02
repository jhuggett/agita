import { Terminal } from "."


export default class CursorMovement {

  constructor(private t: Terminal) {}

  up = (givenCount: number) => {
      var count = givenCount ? givenCount : 1

      this.t.interactor.write(`\u001b[${count.toString()}A`)
  }

  left = (givenCount: number) => {
      var count = givenCount ? givenCount : 1

      this.t.interactor.write(`\u001b[${count.toString()}D`)
  }

  right = (givenCount: number) => {
      var count = givenCount ? givenCount : 1

      this.t.interactor.write(`\u001b[${count.toString()}C`)
  }

  down = (givenCount: number) => {
      var count = givenCount ? givenCount : 1

      this.t.interactor.write(`\u001b[${count.toString()}B`)
  }

  moveTo = (x: number, y: number) => {
    this.t.interactor.write(`\u001b[${y};${x}H`)
  }
}