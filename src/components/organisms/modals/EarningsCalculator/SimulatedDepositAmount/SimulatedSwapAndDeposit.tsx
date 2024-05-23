import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Skeleton,
  Typography,
} from '@mui/material'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'

import useSupportedTokenUserBalances from '@/hooks/web3/useSupportedTokenUserBalances'

import OneInchLogo from '@/assets/logo/OneInchLogo'

import { SupportedTokenInfo, SupportedTokens } from '@/constants/tokens'
import { formatAmount } from '@/utils'

type SimulatedSwapAndDepositProps = {
  setSelectedBalance: Dispatch<
    SetStateAction<{ balance: string; decimals: number }>
  >
}

const SimulatedSwapAndDeposit: React.FC<SimulatedSwapAndDepositProps> = ({
  setSelectedBalance,
}) => {
  const [selectedToken, setSelectedToken] = useState<string>(
    SupportedTokens.USDC
  )

  const tokens = useSupportedTokenUserBalances()

  const showOneInch = useMemo(
    () => selectedToken !== SupportedTokens.USDC,
    [selectedToken]
  )

  useEffect(() => {
    if (!tokens) return

    const token = tokens.find(
      (token) => token.symbol === selectedToken
    ) as SupportedTokenInfo & { balance: BigNumber }

    setSelectedBalance({
      balance: formatUnits(token.balance, token.decimals),
      decimals: token.decimals,
    })
  }, [tokens, selectedToken, setSelectedBalance])

  const handleChange = (e: SelectChangeEvent) => {
    const symbol = e.target.value as SupportedTokens
    setSelectedToken(symbol)
  }

  return (
    <Box px={2} py={1.5}>
      <Box display='flex' alignItems='center' mb={2}>
        <Typography variant='subtitle2' component='p' mr={0.5}>
          Deposit with any token. {showOneInch && 'Powered by 1inch'}
        </Typography>
        {showOneInch && <OneInchLogo />}
      </Box>

      {!tokens ? (
        <Skeleton variant='rounded' height={60} />
      ) : (
        <FormControl fullWidth={true}>
          <InputLabel shrink={true} htmlFor='multi-asset-selector'>
            Available Assets
          </InputLabel>
          <Select
            notched={true}
            value={selectedToken}
            inputProps={{
              id: 'multi-asset-selector',
            }}
            onChange={handleChange}
            input={<OutlinedInput label='Available Assets' />}
          >
            {Object.values(tokens).map(
              ({ icon, symbol, decimals, balance }) => (
                <MenuItem key={symbol} value={symbol}>
                  {icon}
                  <Typography
                    variant='inherit'
                    mx={1}
                    component='span'
                    color={(theme) => theme.palette.text.disabled}
                  >
                    {symbol}
                  </Typography>
                  <Typography component='span' variant='inherit'>
                    {formatAmount(formatUnits(balance, decimals))}
                  </Typography>
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
      )}
    </Box>
  )
}

export default SimulatedSwapAndDeposit
