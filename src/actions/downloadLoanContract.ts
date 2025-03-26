'use server'

import chromium from '@sparticuz/chromium-min'
import { Browser, launch } from 'puppeteer'
import { Browser as CoreBrowser, launch as coreLaunch } from 'puppeteer-core'

const downloadLoanContract = async (contract: string) => {
  let browser: Browser | CoreBrowser

  if (process.env.NODE_ENV === 'production') {
    browser = await coreLaunch({
      headless: chromium.headless,
      args: chromium.args,
      executablePath: await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar'
      ),
      defaultViewport: chromium.defaultViewport,
    })
  } else {
    browser = await launch()
  }

  const page = await browser.newPage()

  page.setContent(`<html><body>${contract}</body></html>`)

  const pdfBlob = await page.pdf()

  return pdfBlob
}

export default downloadLoanContract
