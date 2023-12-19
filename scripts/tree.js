import timedAction from "./timedAction.js";

export default class Tree {
  constructor(map, assets, type, data) {
    this.grown = true;
    this.type = type;

    //create tree stumps on map
    if (type === "tree") {
      this.stumpSprite = new PIXI.Sprite(assets.loadedAssets.treeStump);
    } else {
      this.stumpSprite = new PIXI.Sprite(assets.loadedAssets.bigTreeStump);
    }
    this.stumpSprite.x = data.x;
    this.stumpSprite.y = data.y;
    map.map.addChild(this.stumpSprite);

    //create grown trees on mapLayer2
    if (type === "tree") {
      this.grownSprite = new PIXI.Sprite(assets.loadedAssets.tree);
      this.grownSprite.x = data.x;
    } else if (type === "big") {
      this.grownSprite = new PIXI.Sprite(assets.loadedAssets.bigTree);
      this.grownSprite.x = data.x - 32;
    } else if (type === "bigApple") {
      this.grownSprite = new PIXI.Sprite(assets.loadedAssets.bigTreeApples);
      this.grownSprite.x = data.x - 32;
    }
    this.grownSprite.y = data.y - 64;
    map.mapLayer2.addChild(this.grownSprite);

    this.apples = false;
    type === "bigApple" && (this.apples = true);

    this.collision = {
      x: data.x,
      y: data.y,
    };

    this.interactions = [
      {
        x: data.x,
        y: data.y - 64,
      },
      {
        x: data.x,
        y: data.y + 64,
      },
      {
        x: data.x - 64,
        y: data.y,
      },
      {
        x: data.x + 64,
        y: data.y,
      },
    ];
  }

  async use(app, player, map, gameSettings, assets) {
    try {
      let timerLength;

      if (this.type === "tree") {
        player.inventory.hasAxe ? (timerLength = 2000) : (timerLength = 5000);
      } else if (this.apples) {
        player.inventory.hasAxe ? (timerLength = 5000) : (timerLength = 1000);
      } else {
        timerLength = 5000;
      }

      const timer = await timedAction(app, player, gameSettings, timerLength);

      if (this.type === "tree") {
        //chopping down normal tree
        this.grown = false;
        map.mapLayer2.removeChild(this.grownSprite);
        player.inventory.materials.wood += 1;
      } else if (this.apples) {
        //apple tree
        if (player.inventory.hasAxe) {
          //chopping down apple tree
          this.grown = false;
          map.mapLayer2.removeChild(this.grownSprite);
          player.inventory.materials.wood += 2;
        } else {
          //just picking apples
          this.apples = false;
          this.grownSprite.texture = assets.loadedAssets.bigTree;
        }
        //get apples
        const randomNumber = Math.floor(Math.random() * 3) + 1;
        player.inventory.materials.apple += randomNumber;
      } else {
        //chopping down big tree
        this.grown = false;
        map.mapLayer2.removeChild(this.grownSprite);
        player.inventory.materials.wood += 2;
      }

      player.updateMaterials(assets);
    } catch (err) {
      console.log(err);
    }
  }
}
