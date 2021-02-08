#!/usr/bin/env node

import { Terminal } from "./Terminal";
import { App } from "./App/app";
import { MainPage } from "./App/Pages/main";



(async () => {
  const app = new App()
  const t = new Terminal()

  app.pushPage(new MainPage(app, t))

  await app.run()

  t.interactor
  .clear()
  
  .showCaret()
})()

