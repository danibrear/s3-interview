export const processRawReport = ({
  domain,
  response,
}: {
  domain: string
  response: Array<{ date: string; totalEmissions: number }>
}) => {
  const reportMap = response.reduce((acc, curr) => {
    if (curr && curr.totalEmissions) {
      acc.set('dates', [...(acc.get('dates') || []), curr.date])
      acc.set(
        'totalEmissions',
        (acc.get('totalEmissions') || 0) + curr.totalEmissions
      )
    }
    if (!curr) {
      return acc
    }
    if (curr?.totalEmissions < acc.get('low') || !acc.has('low')) {
      acc.set('low', curr.totalEmissions)
      acc.set('lowDate', curr.date)
    }
    if (curr?.totalEmissions > acc.get('high') || !acc.has('high')) {
      acc.set('high', curr.totalEmissions)
      acc.set('highDate', curr.date)
    }
    return acc
  }, new Map())
  return {
    domain,
    dates: reportMap.get('dates') || [],
    totalEmissions: reportMap.get('totalEmissions') || 0,
    high: {
      value: reportMap.get('high') || 0,
      date: reportMap.get('highDate') || '',
    },
    low: {
      value: reportMap.get('low') || 0,
      date: reportMap.get('lowDate') || '',
    },
  }
}
