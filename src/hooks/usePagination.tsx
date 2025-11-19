import { useEffect, useState } from 'react'

export type PaginationType = {
  currentPage: number
  pages: number[]
  hasPrevPage: boolean
  hasNextPage: boolean
  setPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  paginateData: <T>(data: T[], fillData?: boolean) => T[]
}

const usePagination = (
  rowPerPage: number,
  totalCount: number
): PaginationType => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(totalCount / rowPerPage)

  const pages = [...Array(totalPages)].map((_, index) => index + 1)

  const hasPrevPage = currentPage !== 1

  const hasNextPage = currentPage !== totalPages

  const setPage = (page: number) => setCurrentPage(page)

  const nextPage = () => setCurrentPage((prev) => prev + 1)

  const prevPage = () => setCurrentPage((prev) => prev - 1)

  const paginateData = <T,>(data: T[], fillData?: boolean): T[] => {
    const isLastPage = currentPage === totalPages

    const startIndex = (currentPage - 1) * rowPerPage
    const endIndex = Math.min(currentPage * rowPerPage, totalCount)

    const paginated = [...data].slice(startIndex, endIndex)

    return fillData && isLastPage && paginated.length !== rowPerPage
      ? [...data].slice(Math.max(0, endIndex - rowPerPage), endIndex)
      : paginated
  }

  useEffect(() => {
    if (!pages.includes(currentPage)) {
      setCurrentPage(1)
    }
  }, [currentPage, pages])

  return {
    currentPage,
    pages,
    hasPrevPage,
    hasNextPage,
    setPage,
    nextPage,
    prevPage,
    paginateData,
  }
}

export default usePagination
