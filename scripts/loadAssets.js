const loadAssets = async () => {
  try {
    //create bundle of textures to load
    PIXI.Assets.addBundle("assets", {
      playerA: "./assets/player/player_1.png",

      speech: "./assets/player/speech.png",
      speechMini: "./assets/player/speech-mini.png",
      speechLong: "./assets/player/speech-long.png",
      speechExtend: "./assets/player/speech-extend.png",

      playerBar: "./assets/ui/player-bar.png",

      map: "./assets/map/game_map.png",

      wood: "./assets/objects/wood.png",
      apple: "./assets/objects/food/apple.png",

      tree: "./assets/objects/trees/tree.png",
      bigTree: "./assets/objects/trees/big-tree.png",
      bigTreeApples: "./assets/objects/trees/big-tree-apples.png",
      treeStump: "./assets/objects/trees/tree-stump.png",
      bigTreeStump: "./assets/objects/trees/big-tree-stump.png",

      axe: "assets/objects/tools/axe.png",
    });

    //load all the textures
    const loadedAssets = await PIXI.Assets.loadBundle("assets");

    //return textures
    return {
      loadedAssets,
    };
  } catch (err) {
    console.log(err);
  }
};

export default loadAssets;
