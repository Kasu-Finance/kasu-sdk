import { Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'
import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'

type DefinitionsAndInterprationProps = {
  formattedText: ExemptLoanContract | RetailLoanContract | undefined
  isExempt: boolean
}

const DefinitionsAndInterpration: React.FC<DefinitionsAndInterprationProps> = ({
  formattedText,
  isExempt,
}) => {
  const { t } = getTranslation()

  return (
    <li>
      {formattedText?.['subheader-3'].list['list-0'].title ??
        t('modals.loanContract.subheader-3.list.list-0.title')}
      <OrderedList sx={{ pl: 1.5 }}>
        <li>
          <Typography variant='baseSmBold'>
            {t('modals.loanContract.subheader-3.list.list-0.list-0-list.title')}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-0'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-0.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-0'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-0.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-1'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-1.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-1'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-1.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-2'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-2.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-2'].description ??
              t(
                `modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-2.description.${isExempt ? 'exempt' : 'retail'}`
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-3'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-3.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-3'].description ??
              t(
                `modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-3.description.${isExempt ? 'exempt' : 'retail'}`
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-4'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-4.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-4'].description ??
              t(
                `modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-4.description.${isExempt ? 'exempt' : 'retail'}`
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-5'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-5.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-5'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-5.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-6'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-6.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-6'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-6.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-7'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-7.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-7'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-7.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-8'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-8.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-8'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-8.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-9'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-9.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-9'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-9.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-10'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-10.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-10'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-10.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-11'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-11.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-11'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-11.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-12'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-12.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-12'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-12.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-13'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-13.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-13'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-13.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-14'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-14.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-14'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-14.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-15'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-15.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-15'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-15.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-16'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-16.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-16'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-16.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-17'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-17.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-17'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-17.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-18'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-18.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-18'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-18.description'
              )}
          </Typography>
          <Typography variant='baseSm' display='block' mt={1}>
            <strong>
              {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
                'list-0-list-0'
              ]['list-19'].label ??
                t(
                  'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-19.label'
                )}{' '}
            </strong>
            {formattedText?.['subheader-3'].list['list-0']['list-0-list'][
              'list-0-list-0'
            ]['list-19'].description ??
              t(
                'modals.loanContract.subheader-3.list.list-0.list-0-list.list-0-list-0.list-19.description'
              )}
          </Typography>
        </li>
      </OrderedList>
    </li>
  )
}

export default DefinitionsAndInterpration
