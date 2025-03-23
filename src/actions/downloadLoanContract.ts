'use server'

import { executablePath } from 'puppeteer'
import { launch } from 'puppeteer-core'

const downloadLoanContract = async (contract: string) => {
  const browser = await launch({
    headless: true,
    args: [
      `--no-sandbox`,
      `--headless`,
      `--disable-gpu`,
      `--disable-dev-shm-usage`,
    ],
    executablePath: executablePath(),
  })

  const page = await browser.newPage()

  page.setContent(`<html><body>${contract}</body></html>`)

  const pdfBlob = await page.pdf()

  return pdfBlob
}

export default downloadLoanContract
