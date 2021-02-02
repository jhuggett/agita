import { UserInteractionView } from "./User Interactions";

// might not be needed

export class ViewStack {

  private stack: UserInteractionView[] = []

  current() : UserInteractionView {
    return this.stack[this.stack.length - 1]
  }
  
  forward(view: UserInteractionView) : UserInteractionView {
    this.stack.push(view)
    return this.current()
  }

  back() : UserInteractionView {
    this.stack.pop()
    return this.current()
  }

}