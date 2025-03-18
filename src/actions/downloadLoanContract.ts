'use server'

import { launch } from 'puppeteer'

const downloadLoanContract = async (contract: string) => {
  const browser = await launch()

  const page = await browser.newPage()

  page.setContent(`<html><body>${contract}</body></html>`)

  const pdfBlob = await page.pdf({
    path: 'test.pdf',
  })

  return pdfBlob
}

export default downloadLoanContract
