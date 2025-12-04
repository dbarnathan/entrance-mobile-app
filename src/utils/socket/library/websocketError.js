export default class WebsocketError extends Error {
  constructor(errorCode, message, info) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode || 3000;
    this.info = info;
  }
}