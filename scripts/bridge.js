import timedAction from "./timedAction.js";

export default class Bridge {
  constructor(arrOfObj, id) {
    this.built = false;
    this.blocks = arrOfObj;
    this.id = id;
    this.bridgeBuildStart = {};

    //work out orientation
    if (arrOfObj[0].y == arrOfObj[1].y) {
      this.orientation = "horizontal";
    } else {
      this.orientation = "vertical";
    }

    let valuesForCalc;
    //469 is the interact blocks
    if (this.orientation === "horizontal") {
      valuesForCalc = arrOfObj.map((item) => item.x).sort();
      this.bridgeBuildStart.x = valuesForCalc[1];
      this.bridgeBuildStart.y = arrOfObj[0].y;
    } else {
      valuesForCalc = arrOfObj.map((item) => item.y).sort();
      this.bridgeBuildStart.x = arrOfObj[0].x;
      this.bridgeBuildStart.y = valuesForCalc[1];
    }

    const diff =
      valuesForCalc[valuesForCalc.length - 1] - valuesForCalc[0] - 64;
    this.length = diff / 64;
  }

  async use(app, player, map, gameSettings, assets) {
    try {
      let timerLength = this.length * 1000;

      const timer = await timedAction(app, player, gameSettings, timerLength);

      this.built = true;
      player.inventory.materials.wood -= this.length;

      for (let i = 0; i < this.length; i++) {
        const bridgePiece = PIXI.Sprite.from(
          `./assets/objects/${this.orientation}_bridge.png`
        );

        if (this.orientation === "horizontal") {
          bridgePiece.x = this.bridgeBuildStart.x + i * 64;
          bridgePiece.y = this.bridgeBuildStart.y;
        } else {
          bridgePiece.x = this.bridgeBuildStart.x;
          bridgePiece.y = this.bridgeBuildStart.y + i * 64;
        }

        map.map.addChild(bridgePiece);
      }
      player.updateMaterials(assets);
    } catch (err) {
      console.log(err);
    }
  }
}
