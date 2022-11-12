/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class ExaltedDemakeItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    // Get the Item's data
  }

  async _preCreate(createData, options, userId) {
    this.updateSource({ img: this.getImageUrl(createData.type) });
  }

  getImageUrl(type) {
    if (type === 'intimacy') {
      return "systems/exalteddemake/assets/icons/hearts.svg";
    }
    if (type === 'spell') {
      return "systems/exalteddemake/assets/icons/magic-swirl.svg";
    }
    if (type === 'initiation') {
      return "icons/svg/book.svg";
    }
    if (type === 'merit') {
      return "icons/svg/coins.svg"
    }
    if (type === 'weapon') {
      return "icons/svg/sword.svg";
    }
    if (type === 'armor') {
      return "systems/exalteddemake/assets/icons/breastplate.svg";
    }
    if (type === 'charm' || type === 'action') {
      return "icons/svg/explosion.svg";
    }
    if (type === 'specialability') {
      return "icons/svg/aura.svg";
    }
    if (type === 'craftproject') {
      return "systems/exalteddemake/assets/icons/anvil-impact.svg";
    }
  }
}