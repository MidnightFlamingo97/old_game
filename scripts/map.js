export default class Map {
  constructor(app, assets) {
    this.map = new PIXI.Container();
    this.offset = {
      x: 240,
      y: -50,
    };

    this.map.x = app.screen.width / 2 - 6400 + this.offset.x;
    this.map.y = app.screen.height / 2 - 6400 + this.offset.y;
    this.map.name = "map";

    app.stage.addChildAt(this.map, 0);

    const background = new PIXI.Sprite(assets.loadedAssets.map);
    this.map.addChild(background);

    this.mapLayer2 = new PIXI.Container();
    this.mapLayer2.x = app.screen.width / 2 - 6400 + this.offset.x;
    this.mapLayer2.y = app.screen.height / 2 - 6400 + this.offset.y;
    app.stage.addChildAt(this.mapLayer2,1);
  }

  updatePosition(app) {
    this.map.x = app.screen.width / 2 - 6400 + this.offset.x;
    this.map.y = app.screen.height / 2 - 6400 + this.offset.y;
    this.mapLayer2.x = app.screen.width / 2 - 6400 + this.offset.x;
    this.mapLayer2.y = app.screen.height / 2 - 6400 + this.offset.y;
  }
}
