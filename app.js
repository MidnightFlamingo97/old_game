import collisionDetected from "./scripts/collisionDetected.js";
import Player from "./scripts/player.js";
import Map from "./scripts/map.js";
import loadAssets from "./scripts/loadAssets.js";
import getMapData from "./scripts/mapData.js";
import createTrees from "./scripts/createTrees.js";
import LoadingScreen from "./scripts/loadingScreen.js";
import toggleNight from "./scripts/nightTime.js";

//initialise game
const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0x000000,
});
document.body.appendChild(app.view);

//make loading screen
const loadingScreen = new LoadingScreen(app);

//setup the game
let mapData;
let assets;
let trees;
let map;
let player;

const setup = async () => {
  try {
    assets = await loadAssets();
    mapData = await getMapData();

    map = new Map(app, assets);
    player = new Player(app, assets);

    trees = await createTrees(map, mapData, assets);

    window.addEventListener("resize", () => {
      player.updatePosition(app);
      map.updatePosition(app);
    });

    player.updateMaterials(assets);

    app.stage.removeChild(loadingScreen.loadingScreen);

    toggleNight(map, player);

    app.ticker.add((delta) => loop(delta));
  } catch (err) {
    console.log(err);
  }
};

//game settings & general values
const gameSettings = {
  movementSpeed: 6,
  loopPaused: false,
};

//keys
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

let lastKeyPressed = "";

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      keys.w = true;
      lastKeyPressed = "w";
      break;
    case "a":
      keys.a = true;
      lastKeyPressed = "a";
      break;
    case "s":
      keys.s = true;
      lastKeyPressed = "s";
      break;
    case "d":
      keys.d = true;
      lastKeyPressed = "d";
      break;
    case " ":
      interact();
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
      keys.w = false;
      break;
    case "a":
      keys.a = false;
      break;
    case "s":
      keys.s = false;
      break;
    case "d":
      keys.d = false;
      break;
  }

  keys.w && (lastKeyPressed = "w");
  keys.a && (lastKeyPressed = "a");
  keys.s && (lastKeyPressed = "s");
  keys.d && (lastKeyPressed = "d");
});

//frames
const loop = (delta) => {
  if (!gameSettings.loopPaused) {
    //create proposed position
    const proposedPosition = {
      x: player.x,
      y: player.y,
    };

    keys.w &&
      lastKeyPressed === "w" &&
      (proposedPosition.y = player.y - gameSettings.movementSpeed);
    keys.a &&
      lastKeyPressed === "a" &&
      (proposedPosition.x = player.x - gameSettings.movementSpeed);
    keys.s &&
      lastKeyPressed === "s" &&
      (proposedPosition.y = player.y + gameSettings.movementSpeed);
    keys.d &&
      lastKeyPressed === "d" &&
      (proposedPosition.x = player.x + gameSettings.movementSpeed);

    //***** COLLISIONS *****//
    //check if about to hit main collision
    const isMainCollision = collisionDetected(
      player,
      proposedPosition,
      mapData.mainCollisions
    );

    //check if on, then about to hit one way collision
    const stoodOnOneWayCollision = collisionDetected(
      player,
      player,
      mapData.oneWayCollisions
    );
    let isOneWayCollision = false;
    if (stoodOnOneWayCollision.state) {
      let idToCheck = 469;
      if (stoodOnOneWayCollision.dataType == 469) {
        idToCheck = 470;
      }

      isOneWayCollision = collisionDetected(
        player,
        proposedPosition,
        mapData.oneWayCollisions.filter((item) => item.dataType == idToCheck)
      );
    }

    //check if bridge is built, then check about to hit bridge collision
    let isBridgeCollision = false;

    //loop through bridge layers and make array of just collision blocks
    for (let i = 0; i < mapData.bridges.length; i++) {
      if (!mapData.bridges[i].built) {
        const currentLayerCollision = collisionDetected(
          player,
          proposedPosition,
          mapData.bridges[i].blocks.filter((item) => item.dataType == 468)
        );

        if (currentLayerCollision.state) {
          isBridgeCollision = true;
          break;
        }
      }
    }

    //tree stump collisions
    const treeCollisions = trees.map((item) => item.collision);
    const isTreeCollision = collisionDetected(
      player,
      proposedPosition,
      treeCollisions
    );

    //if not hitting collision, then update map and player
    if (
      !isMainCollision.state &&
      !isOneWayCollision.state &&
      !isBridgeCollision &&
      !isTreeCollision.state
    ) {
      map.map.x += player.x - proposedPosition.x;
      map.map.y += player.y - proposedPosition.y;
      map.mapLayer2.x += player.x - proposedPosition.x;
      map.mapLayer2.y += player.y - proposedPosition.y;

      map.offset.x += player.x - proposedPosition.x;
      map.offset.y += player.y - proposedPosition.y;

      player.x = proposedPosition.x;
      player.y = proposedPosition.y;

      player.animate(false, keys, lastKeyPressed);
    }
    //***** /COLLISIONS *****//

    //***** INTERACTIONS *****//
    let isTalking = false;
    onInteractiveBlock = null;
    //check if stood on bridge interaction
    for (let i = 0; i < mapData.bridges.length; i++) {
      if (!mapData.bridges[i].built) {
        const currentLayerInteraction = collisionDetected(
          player,
          player,
          mapData.bridges[i].blocks.filter((item) => item.dataType == 469)
        );

        if (currentLayerInteraction.state) {
          const requirementsMet =
            player.inventory.materials.wood >= mapData.bridges[i].length;

          onInteractiveBlock = {
            array: mapData.bridges,
            index: i,
            requirementsMet: requirementsMet,
          };

          player.buildSpeech(app, assets, [
            {
              materialTexture: assets.loadedAssets.wood,
              qty: player.inventory.materials.wood,
              requirementsMet: requirementsMet,
              craftQtyNeeded: mapData.bridges[i].length,
            },
          ]);

          isTalking = true;
          break;
        }
      }
    }

    //check tree interactions
    for (let i = 0; i < trees.length; i++) {
      if (trees[i].grown) {
        const currentLayerInteraction = collisionDetected(
          player,
          player,
          trees[i].interactions
        );

        //if player is standing next to a grown tree
        if (currentLayerInteraction.state) {
          //standard trees
          if (trees[i].type === "tree") {
            onInteractiveBlock = {
              array: trees,
              index: i,
              requirementsMet: true,
            };
            player.buildSpeech(app, assets, [
              {
                materialTexture: assets.loadedAssets.wood,
                qty: "+1",
                requirementsMet: true,
              },
            ]);
          } else {
            // big or apple trees
            if (player.inventory.hasAxe) {
              //if player has axe
              onInteractiveBlock = {
                array: trees,
                index: i,
                requirementsMet: true,
              };

              //check if tree has apples
              if (trees[i].apples) {
                player.buildSpeech(app, assets, [
                  {
                    materialTexture: assets.loadedAssets.wood,
                    qty: "+2",
                    requirementsMet: true,
                  },
                  {
                    materialTexture: assets.loadedAssets.apple,
                    qty: "+?",
                    requirementsMet: true,
                  },
                ]);
              } else {
                player.buildSpeech(app, assets, [
                  {
                    materialTexture: assets.loadedAssets.wood,
                    qty: "+2",
                    requirementsMet: true,
                  },
                ]);
              }
            } else {
              //if player does not have axe
              //check if tree has apples
              if (trees[i].apples) {
                onInteractiveBlock = {
                  array: trees,
                  index: i,
                  requirementsMet: true,
                };
                player.buildSpeech(app, assets, [
                  {
                    materialTexture: assets.loadedAssets.apple,
                    qty: "+?",
                    requirementsMet: true,
                  },
                ]);
              } else {
                player.buildSpeech(app, assets, [
                  {
                    materialTexture: assets.loadedAssets.axe,
                    qty: "X",
                    requirementsMet: false,
                  },
                ]);
              }
            }
          }
          isTalking = true;
          break;
        }
      }
    }

    //if not talking, close speech
    !isTalking && player.stopSpeech(app);

    //***** /INTERACTIONS *****//
  }
};

let onInteractiveBlock = null;

const interact = () => {
  if (
    onInteractiveBlock &&
    onInteractiveBlock.requirementsMet &&
    !gameSettings.loopPaused
  ) {
    player.animate(true);

    onInteractiveBlock.array[onInteractiveBlock.index].use(
      app,
      player,
      map,
      gameSettings,
      assets
    );
  }
};
//
//
//
//
//
//
//
//load the game
setup();
