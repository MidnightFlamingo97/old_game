import Bridge from "./bridge.js";

const getMapData = async () => {
  try {
    const res = await fetch("./assets/map/game_map.json");
    const data = await res.json();

    const layers = data.layers;

    const createObjArray = (array, id) => {
      const arrayOfObjs = [];

      //first split into array of rows
      const allRows = [];
      for (let i = 0; i < 200; i++) {
        const row = array.slice(i * 200, i * 200 + 200);
        allRows.push(row);
      }

      //create objects with positions
      allRows.forEach((row, i) => {
        row.forEach((item, j) => {
          if (item == id) {
            arrayOfObjs.push({
              x: j * 64,
              y: i * 64,
              id: i * 64 + (j + 1),
              dataType: id,
            });
          }
        });
      });

      return arrayOfObjs;
    };

    const mainCollisionData = layers
      .filter((item) => item.name === "Collisions")[0]
      .layers.filter((item) => item.name === "Main Collisions")[0].data;

    const oneWayCollisionData = layers
      .filter((item) => item.name === "Collisions")[0]
      .layers.filter((item) => item.name === "One Way Collisions")[0].data;

    const bridges = [];

    layers
      .filter((item) => item.name === "Bridge Collisions")[0]
      .layers.forEach((layer) => {
        const thisLayerObjs = createObjArray(layer.data, 468).concat(
          createObjArray(layer.data, 469)
        );
        bridges.push(new Bridge(thisLayerObjs, layer.name));
      });

    const treeLocationData = layers.filter(
      (item) => item.name === "Tree Locations"
    )[0].data;

    return {
      mainCollisions: createObjArray(mainCollisionData, 468),
      oneWayCollisions: createObjArray(oneWayCollisionData, 469).concat(
        createObjArray(oneWayCollisionData, 470)
      ),
      bridges: bridges,
      treeLocations: createObjArray(treeLocationData, 469).concat(
        createObjArray(treeLocationData, 470)
      ),
    };
  } catch (err) {
    console.log(err);
  }
};
export default getMapData;
