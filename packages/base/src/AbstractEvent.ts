/**
 * All events fired by draggable inherit this class. You can call `cancel()` to
 * cancel a specific event or you can check if an event has been canceled by
 * calling `canceled()`.
 */
export default abstract class AbstractEvent {
  static type = 'event';
  /**
   * Event cancelable
   */
  static cancelable = false;

  /**
   * Private instance variable to track canceled state
   */
  private _canceled = false;

  /**
   * Read-only cancelable
   */
  get cancelable() {
    return (this.constructor as typeof AbstractEvent).cancelable;
  }

  get type() {
    return (this.constructor as typeof AbstractEvent).type;
  }

  /**
   * Cancels the event instance
   */
  cancel() {
    if (this.cancelable) {
      this._canceled = true;
    }
  }

  /**
   * Check if event has been canceled
   */
  canceled() {
    return this._canceled;
  }
}
