const timedAction = (app, player, gameSettings, time) => {
  return new Promise((resolve, reject) => {
    gameSettings.loopPaused = true;
    player.timerProgress(0);
    app.stage.addChild(player.timerBar);
    let counter = 1;
    const timerSteps = 50;

    const interval = setInterval(() => {
      const perc = counter / timerSteps;
      player.timerProgress(perc);
      counter++;
    }, time / timerSteps);

    setTimeout(() => {
      clearInterval(interval);
      app.stage.removeChild(player.timerBar);
      gameSettings.loopPaused = false;
      resolve(true);
    }, time);
  });
};

export default timedAction;
