export const generateChallenge =
  (isIndividual: boolean) => async (params: any) => {
    const res = await fetch('/api/kyc-challenge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...params, isIndividual }),
    })

    return res.json()
  }

export const generateEmailChallenge = async (params: any) => {
  const res = await fetch('/api/email-challenge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...params }),
  })

  return res.json()
}
