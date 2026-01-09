import { providers } from 'ethers'

class QueuedJsonRpcProvider extends providers.JsonRpcProvider {
  private inFlight = 0
  private readonly queue: Array<() => void> = []

  constructor(
    url: string,
    private readonly maxConcurrent = 1
  ) {
    super(url)
  }

  send(method: string, params: Array<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const run = () => {
        this.inFlight += 1

        super
          .send(method, params)
          .then(resolve, reject)
          .finally(() => {
            this.inFlight -= 1
            this.flush()
          })
      }

      this.queue.push(run)
      this.flush()
    })
  }

  private flush() {
    while (this.inFlight < this.maxConcurrent && this.queue.length) {
      const next = this.queue.shift()
      if (!next) break
      next()
    }
  }
}

export default QueuedJsonRpcProvider
