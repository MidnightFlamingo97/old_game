export default class LoadingScreen {
  constructor(app) {
    this.loadingScreen = new PIXI.Container();
    app.stage.addChild(this.loadingScreen);

    const background = new PIXI.Graphics();
    background.beginFill(0x5c6e8a);
    background.drawRect(0, 0, app.screen.width, app.screen.height);
    background.endFill();
    this.loadingScreen.addChild(background);

    const loadingText = new PIXI.Text("Loading", {
      fontFamily: "Balsamiq Sans, sans-serif",
      fontSize: 14,
      fill: 0xffffff,
    });
    loadingText.x = app.screen.width / 2 - loadingText.width / 2;
    loadingText.y = app.screen.height / 2 - loadingText.height / 2;
    this.loadingScreen.addChild(loadingText);
  }
}
