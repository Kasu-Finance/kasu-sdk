interface TrancheBase {
  apy: string
  poolCapacity: string
}

const getAverageApyAndTotal = <T extends TrancheBase>(tranches: T[]) => {
  const totals = tranches.reduce(
    (acc, trench) => {
      acc.totalApy += parseFloat(trench.apy) * parseInt(trench.poolCapacity)
      acc.totalCapacity += parseInt(trench.poolCapacity)
      return acc
    },
    { totalApy: 0, totalCapacity: 0 }
  )

  return {
    averageApy: totals.totalApy / totals.totalCapacity,
    totalCapacity: totals.totalCapacity,
  }
}

export default getAverageApyAndTotal
