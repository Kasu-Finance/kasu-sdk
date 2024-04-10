interface Config {
  networkScanUrl: string
}

const config: Config = {
  networkScanUrl: process.env.NEXT_PUBLIC_NETWORK_SCAN_URL || '',
}

export default config
