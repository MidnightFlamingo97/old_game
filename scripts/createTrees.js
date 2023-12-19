import Tree from "./tree.js";

const createTrees = async (map, mapData, assets) => {
  try {
    const locations = mapData.treeLocations;
    const randomTreeNumber = Math.floor(Math.random() * 6) + 15;

    const potentialLocations = [];

    for (let i = 0; i < randomTreeNumber; i++) {
      const randomIndex = Math.floor(Math.random() * locations.length);

      potentialLocations.push(locations[randomIndex]);
      locations.splice(randomIndex, 1);
    }

    //check player has at least 2 trees (check for 2x 469)
    const startingTrees = potentialLocations.filter(
      (item) => item.dataType == 469
    );

    if (startingTrees.length < 3) {
      const treesToAdd = 3 - startingTrees.length;

      const newTrees = locations.filter((item) => item.dataType == 469);

      for (let i = 0; i < treesToAdd; i++) {
        potentialLocations.push(newTrees[i]);
      }
    }

    const treeTypes = ["bigApple", "bigApple", "big", "big"];

    const trees = [];

    treeTypes.forEach((item, i) => {
      trees.push(new Tree(map, assets, item, potentialLocations[i]));
    });

    for (let i = 4; i < potentialLocations.length; i++) {
      trees.push(new Tree(map, assets, "tree", potentialLocations[i]));
    }

    return trees;
  } catch (err) {
    console.log(err);
  }
};

export default createTrees;
