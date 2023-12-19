export default class StatBar {
  constructor() {
    this.bar = new PIXI.Graphics();
    this.bar.beginFill(0xaed499);
    this.bar.drawRect(0, 0, 161, 4);
    this.bar.endFill();
    this.bar.x = 51;
  }

  update(perc) {
    const width = (161 / 100) * perc;
  }
}
