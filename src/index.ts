#!/usr/bin/env node

import { Terminal } from "./Terminal";
import { SelectList, SelectListResponse } from "./Terminal/User Interactions/select-list";
import { RequestConfirmation } from "./Terminal/User Interactions/request-confirmation";




(async () => {
  const T = new Terminal()

  const logo = T.interactor.color.yellow('a') + T.interactor.color.red(T.interactor.decorate.bold('GIT')) + T.interactor.color.yellow('a') 
  
  T.interactor.clear()


  const value = (await T.stack.forward(new SelectList(T, {
    text: 'Welcome to ' + logo,
    options: [
      'Status',
      'Commit',
    ],
    back: 'Back'
  })).run()) as SelectListResponse

  switch (value.index) {
    case 0: {
      console.log('status is great');
      break
    }
    case 1: {
      await T.stack.forward(new RequestConfirmation(T, {
        question: 'Are you sure you want to commit?'
      })).run()
      break
    }
    case -1: {

    }
  }
  
})()

