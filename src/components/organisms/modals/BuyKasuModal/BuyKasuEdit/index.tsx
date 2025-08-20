import {
  Button,
  FormControlLabel,
  Link,
  Stack,
  Typography,
} from '@mui/material'

import useStepperState from '@/hooks/context/useStepperState'
import getTranslation from '@/hooks/useTranslation'

import CustomCheckbox from '@/components/atoms/CustomCheckbox'

import OneInchLogo from '@/assets/logo/OneInchLogo'

import BuyKasuLock from '@/components/organisms/modals/BuyKasuModal/BuyKasuEdit/BuyKasuLock'
import ExchangeRate from '@/components/organisms/modals/BuyKasuModal/BuyKasuEdit/ExchangeRate'
import SupportedAssetsDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/SupportedAssetsDropdown'
import { SupportedTokens } from '@/constants/tokens'
import useBuyKasuModalState from '@/hooks/context/useBuyKasuModalState'

const BuyKasuModalEdit = () => {
  const { t } = getTranslation()

  const { nextStep } = useStepperState()

  const { selectedToken, setSelectedToken, swapAndLock, toggleSwapAndLock } =
    useBuyKasuModalState()

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Typography
          variant='baseMd'
          display='inline-flex'
          alignItems='center'
          gap={1}
        >
          {t('modals.earningsCalculator.simulatedAmount.metric-1')}{' '}
          {selectedToken !== SupportedTokens.USDC && (
            <>
              {t('modals.earningsCalculator.simulatedAmount.metric-2')}
              <OneInchLogo />
            </>
          )}
        </Typography>
        <Typography
          variant='baseMd'
          display='inline-flex'
          alignItems='center'
          gap={1}
          color='gold.dark'
        >
          {t('modals.earningsCalculator.simulatedAmount.metric-3')}{' '}
        </Typography>

        <SupportedAssetsDropdown
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
        />
      </Stack>
      {/* <SelectedAssetInput /> */}
      <ExchangeRate />
      <FormControlLabel
        control={
          <CustomCheckbox
            checked={swapAndLock}
            onChange={toggleSwapAndLock}
            name='Automatically lock'
            sx={{ mr: 2 }}
          />
        }
        label={
          <Typography variant='baseMd' component='p'>
            {t('modals.buyKasu.automaticallyLock')}
          </Typography>
        }
      />
      <BuyKasuLock />
      <Button
        variant='contained'
        color='secondary'
        onClick={() => nextStep()}
        LinkComponent={Link}
        fullWidth
        sx={{ textTransform: 'capitalize' }}
      >
        {t('modals.buyKasu.completed.action')}
      </Button>
      <Typography
        variant='baseMd'
        display='inline-flex'
        alignItems='center'
        gap={1}
        color='gold.extraDark'
      >
        {t('modals.buyKasu.completed.disclaimer')}
      </Typography>
    </Stack>
  )
}

export default BuyKasuModalEdit
