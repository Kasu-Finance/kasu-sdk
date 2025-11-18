export class KasuSdkNotReadyError extends Error {
  constructor() {
    super('KasuSDK is not ready')
    this.name = 'SDK Error'
  }
}
