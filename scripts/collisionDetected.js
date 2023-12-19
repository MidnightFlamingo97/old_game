const collisionDetected = (player, proposedPosition, collisionsArray) => {
  for (let i = 0; i < collisionsArray.length; i++) {
    if (
      proposedPosition.x + 64 >=
        collisionsArray[i].x + player.collisionOffset.right &&
      proposedPosition.x + player.collisionOffset.left <=
        collisionsArray[i].x + 64 &&
      proposedPosition.y + 64 >=
        collisionsArray[i].y + player.collisionOffset.bottom &&
      proposedPosition.y + player.collisionOffset.top <=
        collisionsArray[i].y + 64
    ) {
      return {
        state: true,
        id: collisionsArray[i].id,
        dataType: collisionsArray[i].dataType,
      };
    }
  }
  return {
    state: false,
  };
};

export default collisionDetected;
