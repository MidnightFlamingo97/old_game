import StatBar from "./statBar.js";

export default class Player {
  constructor(app, assets) {
    const map = app.stage.getChildByName("map");

    this.x = app.screen.width / 2 - 32 - map.x;
    this.y = app.screen.height / 2 - 32 - map.y;

    //adjust block collision offset
    this.collisionOffset = {
      top: 40,
      bottom: 2,
      left: 14,
      right: 14,
    };

    this.frameInterval = null;

    //player stats & inventory
    this.stats = {
      health: 100,
      food: 100,
      sleep: 100,
    };

    this.inventory = {
      materials: {
        wood: 7,
        stone: 0,
        apple: 0,
      },

      hasAxe: false,
    };
    this.materialsOrder = [];

    //player group
    this.player = new PIXI.Container();
    this.player.width = 64;
    this.player.height = 64;
    this.player.x = app.screen.width / 2 - 32;
    this.player.y = app.screen.height / 2 - 32;
    app.stage.addChildAt(this.player, 1);

    //player character
    this.sprite = new PIXI.Sprite(assets.loadedAssets.playerA);
    this.player.addChild(this.sprite);
    const characterMask = new PIXI.Graphics();
    characterMask.beginFill(0xffffff);
    characterMask.drawRect(0, 0, 64, 64);
    characterMask.endFill();
    this.player.addChild(characterMask);
    this.player.mask = characterMask;

    //speech container
    this.speechContainer = new PIXI.Container();
    this.speechContainer.x = app.screen.width / 2 + 5;
    this.speechContainer.y = app.screen.height / 2 - 55;

    //space prompt
    this.spacePrompt = new PIXI.Container();
    this.spacePrompt.x = app.screen.width / 2 + 25;
    this.spacePrompt.y = app.screen.height / 2 - 21;
    const spacePromptBg = PIXI.Sprite.from("./assets/player/speech-mini.png");
    this.spacePrompt.addChild(spacePromptBg);

    const spaceText = new PIXI.Text("Space!", {
      fontFamily: "Balsamiq Sans, sans-serif",
      fontSize: 10,
      fill: 0x000000,
    });
    spaceText.x = 10;
    spaceText.y = 1;
    this.spacePrompt.addChild(spaceText);

    //timer progress bar
    this.timerBar = new PIXI.Container();
    const timerBarBg = new PIXI.Sprite(assets.loadedAssets.speechLong);
    this.timerBar.addChild(timerBarBg);
    this.timerBar.x = app.screen.width / 2 + 5;
    this.timerBar.y = app.screen.height / 2 - 71;
    this.timerProgressBar = new PIXI.Graphics();
    this.timerBar.addChild(this.timerProgressBar);

    //player bar
    this.playerBar = new PIXI.Container();
    app.stage.addChildAt(this.playerBar, 3);

    const playerBarBg = new PIXI.Sprite(assets.loadedAssets.playerBar);
    this.playerBar.addChild(playerBarBg);
    this.playerBar.x = app.screen.width / 2 - 768 / 2;
    this.playerBar.y = app.screen.height - 96;

    this.heathBar = new StatBar();
    this.foodBar = new StatBar();
    this.sleepBar = new StatBar();
    this.playerBar.addChild(this.heathBar.bar);
    this.playerBar.addChild(this.foodBar.bar);
    this.playerBar.addChild(this.sleepBar.bar);
    this.heathBar.bar.y = 36;
    this.foodBar.bar.y = 52;
    this.sleepBar.bar.y = 68;

    this.materialSlots = new PIXI.Container();
    this.materialSlots.x = 428;
    this.materialSlots.y = 32;
    this.playerBar.addChild(this.materialSlots);

    // const temp = new PIXI.Graphics();
    // temp.beginFill(0xffffff);
    // temp.drawRect(0, 0, 40, 44);
    // temp.endFill();
    // this.materialSlots.addChild(temp);
  }

  updatePosition(app) {
    const map = app.stage.getChildByName("map");

    this.x = app.screen.width / 2 - 32 - map.x;
    this.y = app.screen.height / 2 - 32 - map.y;
    this.player.x = app.screen.width / 2 - 32;
    this.player.y = app.screen.height / 2 - 32;
    this.spacePrompt.x = app.screen.width / 2 + 5;
    this.spacePrompt.y = app.screen.height / 2 - 71;
    this.speechContainer.x = app.screen.width / 2 + 5;
    this.speechContainer.y = app.screen.height / 2 - 55;
    this.playerBar.x = app.screen.width / 2 - 768 / 2;
    this.playerBar.y = app.screen.height - 96;
  }

  animate(stop, keys, lastKey) {
    if (keys) {
      keys.w && lastKey === "w" && (this.sprite.y = -64);
      keys.a && lastKey === "a" && (this.sprite.y = -192);
      keys.s && lastKey === "s" && (this.sprite.y = 0);
      keys.d && lastKey === "d" && (this.sprite.y = -128);

      if (keys.w || keys.a || keys.s || keys.d) {
        if (!this.frameInterval) {
          this.frameInterval = setInterval(() => {
            this.sprite.x -= 64;
            this.sprite.x < -192 && (this.sprite.x = 0);
          }, 80);
        }
      } else {
        clearInterval(this.frameInterval);
        this.frameInterval = null;
        this.sprite.x = 0;
      }
    }

    if (stop) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
      this.sprite.x = 0;
    }
  }

  buildSpeech(app, assets, dataArray) {
    // materialTexture, qty, requirementsMet, craftQtyNeeded

    //check if speech container has children
    if (this.speechContainer.children.length == 0) {
      dataArray.forEach((item, i) => {
        //make container
        const container = new PIXI.Container();
        container.x = 70 * i;

        //apply bg based on index
        let bg;
        if (i == 0) {
          bg = new PIXI.Sprite(assets.loadedAssets.speech);
        } else {
          bg = new PIXI.Sprite(assets.loadedAssets.speechExtend);
        }
        container.addChild(bg);

        //create material icon
        const sprite = new PIXI.Sprite(item.materialTexture);
        sprite.scale.set(0.5);
        sprite.x = 6;
        sprite.y = 18 - sprite.height / 2;
        container.addChild(sprite);

        //create text
        const text = new PIXI.Text("", {
          fontFamily: "Balsamiq Sans, sans-serif",
          fontSize: 14,
          fill: item.requirementsMet ? 0x8db15d : 0x942828,
        });

        //populate Text
        if (item.craftQtyNeeded) {
          item.qty >= item.craftQtyNeeded
            ? (text.text = `${item.craftQtyNeeded}/${item.craftQtyNeeded}`)
            : (text.text = `${item.qty}/${item.craftQtyNeeded}`);
        } else {
          text.text = item.qty;
        }

        //adjust text
        text.x = 55 - text.width / 2;
        text.y = 18 - text.height / 2;
        container.addChild(text);

        //if requirements met, add the space prompt
        if (item.requirementsMet) {
          app.stage.addChild(this.spacePrompt);
        }

        //add to the speech container
        this.speechContainer.addChild(container);
      });

      //add all speech bubbles to screen
      app.stage.addChild(this.speechContainer);
    }
  }

  stopSpeech(app) {
    if (this.speechContainer.children.length > 0) {
      //remove S.Container & space prompt from screen
      //remove children from S.Container
      app.stage.removeChild(this.speechContainer);
      app.stage.removeChild(this.spacePrompt);
      this.speechContainer.removeChildren();
    }
  }

  timerProgress(perc) {
    const width = 60 * perc;

    this.timerProgressBar.clear();
    this.timerProgressBar.beginFill(
      perc > 0.66 ? 0x8db15d : perc > 0.33 ? 0xd79e61 : 0xa35b70
    );
    this.timerProgressBar.drawRect(6, 6, width, 4);
    this.timerProgressBar.endFill();
  }

  updateMaterials(assets) {
    const materialKeys = Object.keys(this.inventory.materials);
    const materialValues = Object.values(this.inventory.materials);

    materialValues.forEach((item, i) => {
      if (item > 0) {
        // add to ordered array if not there
        if (!this.materialsOrder.includes(materialKeys[i])) {
          this.materialsOrder.push(materialKeys[i]);
        }
      } else {
        if (this.materialsOrder.includes(materialKeys[i])) {
          const indexToDelete = this.materialsOrder.indexOf(materialKeys[i]);
          this.materialsOrder.splice(indexToDelete, 1);
        }
      }
    });

    this.materialSlots.removeChildren();

    this.materialsOrder.forEach((item, i) => {
      const container = new PIXI.Container();
      container.x = i * 64;

      let texture;

      item === "wood" && (texture = assets.loadedAssets.wood);
      item === "apple" && (texture = assets.loadedAssets.apple);

      const material = new PIXI.Sprite(texture);
      material.scale.set(0.5);
      material.x = 20 - material.width / 2;
      material.y = 22 - material.height / 2;
      container.addChild(material);

      //get how much from current material

      const number = new PIXI.Text(this.inventory.materials[item].toString(), {
        fontFamily: "Balsamiq Sans, sans-serif",
        fontSize: 14,
        fill: 0xffffff,
      });
      number.x = 36 - number.width;
      number.y = 40 - number.height;
      container.addChild(number);

      this.materialSlots.addChild(container);
    });
  }
}
