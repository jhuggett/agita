


export interface UserInteractionView {
  config: UserInteractionConfig;
  run: () => Promise<UserInteractionResponse>;
  render: () => void;
  react: () => Promise<ReactResponse>;
}

export interface UserInteractionConfig {

}

export interface UserInteractionResponse {

}

export interface ReactResponse {
  finished: boolean
  rerender: boolean
}