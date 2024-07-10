import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import {
  alpha,
  Box,
  Button,
  DialogActions,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import OrderedList from '@/components/atoms/OrderedList'
import UnorderedList from '@/components/atoms/UnorderedList'
import DialogHeader from '@/components/molecules/DialogHeader'

import { formatAmount } from '@/utils'

const TermsAndConditionsModal: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <DialogHeader
        title={t('modals.termsAndConditions.title')}
        onClose={handleClose}
      />
      <DialogContent sx={{ px: 3, py: 1 }}>
        <Box display='grid' gap={2}>
          <Typography variant='subtitle2' component='p' mt={1}>
            {t('modals.termsAndConditions.subtitle')}
          </Typography>
          <Typography
            variant='h6'
            component='span'
            display='block'
            sx={{ textDecoration: 'underline' }}
          >
            {t('modals.termsAndConditions.subheader-1.title')}
          </Typography>
          <Typography variant='body2' component='p'>
            {t('modals.termsAndConditions.subheader-1.description')}
          </Typography>
          <OrderedList
            sx={(theme) => ({
              ...theme.typography.h6,
              fontSize: 18,
              pl: 2,
              'li + li': {
                mt: 1,
              },
            })}
          >
            <li>
              <Typography variant='inherit' component='span'>
                {t(
                  'modals.termsAndConditions.subheader-1.sub-subheader-1.title'
                )}
              </Typography>
              <Typography variant='body2' component='p' display='block' mt={1}>
                {t(
                  'modals.termsAndConditions.subheader-1.sub-subheader-1.description'
                )}
              </Typography>
              <Typography variant='inherit' component='span' fontSize={16}>
                {t('modals.termsAndConditions.keyRisks')}
              </Typography>
              <UnorderedList
                sx={(theme) => ({
                  li: {
                    ...theme.typography.body2,
                    '& + li': {
                      mt: 1,
                    },
                  },
                  mt: 0.5,
                  listStyleType: 'disc',
                  pl: 2,
                })}
              >
                <li>
                  <strong>
                    {t(
                      'modals.termsAndConditions.subheader-1.sub-subheader-1.list.list-0.title'
                    )}
                  </strong>
                  {t(
                    'modals.termsAndConditions.subheader-1.sub-subheader-1.list.list-0.description'
                  )}
                </li>
                <li>
                  <strong>
                    {t(
                      'modals.termsAndConditions.subheader-1.sub-subheader-1.list.list-1.title'
                    )}
                  </strong>
                  {t(
                    'modals.termsAndConditions.subheader-1.sub-subheader-1.list.list-1.description'
                  )}
                </li>
              </UnorderedList>
            </li>
            <li>
              <Typography variant='inherit' component='span'>
                {t(
                  'modals.termsAndConditions.subheader-1.sub-subheader-2.title'
                )}
              </Typography>
              <Typography variant='body2' component='p' display='block' mt={1}>
                {t(
                  'modals.termsAndConditions.subheader-1.sub-subheader-2.description'
                )}
              </Typography>
              <Typography variant='inherit' component='span' fontSize={16}>
                {t('modals.termsAndConditions.keyRisks')}
              </Typography>
              <UnorderedList
                sx={(theme) => ({
                  li: {
                    ...theme.typography.body2,
                    '& + li': {
                      mt: 1,
                    },
                  },
                  mt: 0.5,
                  listStyleType: 'disc',
                  pl: 2,
                })}
              >
                <li>
                  <strong>
                    {t(
                      'modals.termsAndConditions.subheader-1.sub-subheader-2.list.list-0.title'
                    )}
                  </strong>
                  {t(
                    'modals.termsAndConditions.subheader-1.sub-subheader-2.list.list-0.description'
                  )}
                </li>
                <li>
                  <strong>
                    {t(
                      'modals.termsAndConditions.subheader-1.sub-subheader-2.list.list-1.title'
                    )}
                  </strong>
                  {t(
                    'modals.termsAndConditions.subheader-1.sub-subheader-2.list.list-1.description'
                  )}
                </li>
              </UnorderedList>
            </li>
            <li>
              <Typography variant='inherit' component='span'>
                {t(
                  'modals.termsAndConditions.subheader-1.sub-subheader-3.title'
                )}
              </Typography>
              <Typography variant='body2' component='p' display='block' mt={1}>
                {t(
                  'modals.termsAndConditions.subheader-1.sub-subheader-3.description'
                )}
              </Typography>
              <Typography variant='inherit' component='span' fontSize={16}>
                {t('modals.termsAndConditions.keyRisks')}
              </Typography>
              <UnorderedList
                sx={(theme) => ({
                  li: {
                    ...theme.typography.body2,
                    '& + li': {
                      mt: 1,
                    },
                  },
                  mt: 0.5,
                  listStyleType: 'disc',
                  pl: 2,
                })}
              >
                <li>
                  <strong>
                    {t(
                      'modals.termsAndConditions.subheader-1.sub-subheader-3.list.list-0.title'
                    )}
                  </strong>
                  {t(
                    'modals.termsAndConditions.subheader-1.sub-subheader-3.list.list-0.description'
                  )}
                </li>
                <li>
                  <strong>
                    {t(
                      'modals.termsAndConditions.subheader-1.sub-subheader-3.list.list-1.title'
                    )}
                  </strong>
                  {t(
                    'modals.termsAndConditions.subheader-1.sub-subheader-3.list.list-1.description'
                  )}
                </li>
              </UnorderedList>
            </li>
          </OrderedList>
          <Typography variant='h6' component='span' display='block'>
            {t('modals.termsAndConditions.subheader-1.subtitle')}
          </Typography>
          <Typography variant='body2' component='p'>
            {t('modals.termsAndConditions.subheader-1.subtitle-description')}
          </Typography>
          <Typography
            variant='h6'
            component='span'
            display='block'
            sx={{ textDecoration: 'underline' }}
          >
            {t('modals.termsAndConditions.subheader-2.title')}
          </Typography>
          <Typography variant='h6' component='span' fontSize={14}>
            {t('modals.termsAndConditions.subheader-2.description-1')}
          </Typography>
          <Typography variant='body2' component='p'>
            {t('modals.termsAndConditions.subheader-2.description-2')}{' '}
            <strong>
              {t('modals.termsAndConditions.subheader-2.description-3')}
            </strong>
            {t('modals.termsAndConditions.subheader-2.description-4')}
          </Typography>
          <Typography variant='h6' component='span' fontSize={14}>
            {t('modals.termsAndConditions.subheader-2.description-5')}
          </Typography>
          <Typography variant='body2' component='p'>
            {t('modals.termsAndConditions.subheader-2.description-6')}
          </Typography>
          <Typography variant='h6' component='span' fontSize={14}>
            {t('modals.termsAndConditions.subheader-2.description-7')}
          </Typography>
          <UnorderedList
            sx={(theme) => ({
              li: {
                ...theme.typography.body2,
                '& + li': {
                  mt: 1,
                },
              },
              listStyleType: 'disc',
              pl: 2,
            })}
          >
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-2.list-1.list-0.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-2.list-1.list-0.description'
              )}
            </li>
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-2.list-1.list-1.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-2.list-1.list-1.description'
              )}
            </li>
          </UnorderedList>
          <Typography variant='h6' component='span' fontSize={14}>
            {t('modals.termsAndConditions.subheader-2.description-8')}
          </Typography>
          <UnorderedList
            sx={(theme) => ({
              li: {
                ...theme.typography.body2,
                '& + li': {
                  mt: 1,
                },
              },
              pl: 2,
            })}
          >
            <li>{t('modals.termsAndConditions.subheader-2.list-2.list-0')}</li>
            <li>{t('modals.termsAndConditions.subheader-2.list-2.list-1')}</li>
          </UnorderedList>
          <Typography variant='body2' component='p'>
            {t('modals.termsAndConditions.subheader-2.description-9')}
          </Typography>
          <Typography
            variant='h6'
            component='span'
            display='block'
            sx={{ textDecoration: 'underline' }}
          >
            {t('modals.termsAndConditions.subheader-3.title')}
          </Typography>
          <Typography variant='body2' component='p'>
            {t('modals.termsAndConditions.subheader-3.description')}
          </Typography>
          <Typography
            variant='h6'
            component='span'
            display='block'
            fontSize={18}
          >
            {t('modals.termsAndConditions.subheader-3.subtitle')}
          </Typography>
          <Typography variant='body2' component='p'>
            {t('modals.termsAndConditions.subheader-3.subtitle-description')}
          </Typography>
          <Typography
            variant='h6'
            component='span'
            display='block'
            sx={{ textDecoration: 'underline' }}
          >
            {t('modals.termsAndConditions.subheader-4.title')}
          </Typography>
          <Typography variant='body2' component='p'>
            {t('modals.termsAndConditions.subheader-4.description')}
          </Typography>
          <Typography variant='h6' component='span' fontSize={14}>
            {t('modals.termsAndConditions.subheader-4.list.title')}
          </Typography>
          <UnorderedList
            sx={(theme) => ({
              li: {
                ...theme.typography.body2,
                '& + li': {
                  mt: 1,
                },
              },
              pl: 2,
            })}
          >
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-4.list.list-0.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-4.list.list-0.description'
              )}
            </li>
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-4.list.list-1.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-4.list.list-1.description'
              )}
            </li>
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-4.list.list-2.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-4.list.list-2.description'
              )}
            </li>
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-4.list.list-3.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-4.list.list-3.description'
              )}
            </li>
          </UnorderedList>
          <Typography
            variant='h6'
            component='span'
            display='block'
            fontSize={18}
          >
            {t('modals.termsAndConditions.subheader-4.subtitle')}
          </Typography>
          <Typography variant='body2' component='p'>
            {t('modals.termsAndConditions.subheader-4.subtitle-description')}
          </Typography>
          <Typography
            variant='h6'
            component='span'
            display='block'
            sx={{ textDecoration: 'underline' }}
          >
            {t('modals.termsAndConditions.subheader-5.title')}
          </Typography>
          <Typography variant='body2' component='p'>
            {t('modals.termsAndConditions.subheader-5.description')}
          </Typography>
          <Typography variant='h6' component='span' fontSize={14}>
            {t('modals.termsAndConditions.subheader-5.list-0.title')}
          </Typography>
          <UnorderedList
            sx={(theme) => ({
              li: {
                ...theme.typography.body2,
                '& + li': {
                  mt: 1,
                },
              },
              pl: 2,
            })}
          >
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-5.list-0.list-0.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-5.list-0.list-0.description'
              )}
            </li>
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-5.list-0.list-1.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-5.list-0.list-1.description'
              )}
            </li>
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-5.list-0.list-2.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-5.list-0.list-2.description'
              )}
            </li>
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-5.list-0.list-3.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-5.list-0.list-3.description'
              )}
            </li>
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-5.list-0.list-4.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-5.list-0.list-4.description'
              )}
            </li>
          </UnorderedList>
          <Typography
            variant='h6'
            component='span'
            display='block'
            fontSize={18}
          >
            {t('modals.termsAndConditions.subheader-5.subtitle')}
          </Typography>
          <Typography variant='body2' component='p'>
            {t('modals.termsAndConditions.subheader-5.subtitle-description')}
          </Typography>
          <UnorderedList
            sx={(theme) => ({
              li: {
                ...theme.typography.body2,
                '& + li': {
                  mt: 1,
                },
              },
              pl: 2,
            })}
          >
            <li>{t('modals.termsAndConditions.subheader-5.list-1.list-0')}</li>
            <li>{t('modals.termsAndConditions.subheader-5.list-1.list-1')}</li>
            <li>{t('modals.termsAndConditions.subheader-5.list-1.list-2')}</li>
            <li>{t('modals.termsAndConditions.subheader-5.list-1.list-3')}</li>
            <li>{t('modals.termsAndConditions.subheader-5.list-1.list-4')}</li>
          </UnorderedList>
          <Typography
            variant='h6'
            component='span'
            display='block'
            sx={{ textDecoration: 'underline' }}
          >
            {t('modals.termsAndConditions.subheader-6.title')}
          </Typography>
          <Typography variant='body2' component='p'>
            {t('modals.termsAndConditions.subheader-6.description')}
          </Typography>
          <Typography variant='h6' component='span' fontSize={14}>
            {t('modals.termsAndConditions.subheader-6.sub-subheader-1')}
          </Typography>
          <UnorderedList
            sx={(theme) => ({
              li: {
                ...theme.typography.body2,
                '& + li': {
                  mt: 1,
                },
              },
              pl: 2,
            })}
          >
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-6.list-1.list-0.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-6.list-1.list-0.description'
              )}
            </li>
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-6.list-1.list-1.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-6.list-1.list-1.description'
              )}
            </li>
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-6.list-1.list-2.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-6.list-1.list-2.description'
              )}
            </li>
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-6.list-1.list-3.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-6.list-1.list-3.description'
              )}
            </li>
          </UnorderedList>{' '}
          <Typography variant='h6' component='span' fontSize={14}>
            {t('modals.termsAndConditions.subheader-6.sub-subheader-2')}
          </Typography>
          <UnorderedList
            sx={(theme) => ({
              li: {
                ...theme.typography.body2,
                '& + li': {
                  mt: 1,
                },
              },
              pl: 2,
            })}
          >
            <li>
              <strong>
                {t('modals.termsAndConditions.subheader-6.list-2.list-0.title')}
              </strong>
              {t(
                'modals.termsAndConditions.subheader-6.list-2.list-0.description'
              )}
            </li>
          </UnorderedList>
          <Typography variant='h6' component='span' fontSize={14}>
            {t('modals.termsAndConditions.subheader-6.description-1')}
          </Typography>
          <Table
            size='small'
            border={1}
            sx={(theme) => ({
              borderColor: alpha(theme.palette.text.secondary, 0.1),
              borderRadius: 2,
              overflow: 'hidden',
            })}
          >
            <TableHead>
              <TableRow
                sx={(theme) => ({
                  background: alpha(theme.palette.primary.main, 0.5),
                })}
              >
                <TableCell>{t('general.tranche')}</TableCell>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-6.capacity')}
                </TableCell>
                <TableCell>
                  {t(
                    'modals.termsAndConditions.subheader-6.totalLendingRequests'
                  )}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-6.junior')}
                </TableCell>
                <TableCell>{formatAmount(20_000)} USDC</TableCell>
                <TableCell>{formatAmount(70_000)} USDC</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-6.mezzanine')}
                </TableCell>
                <TableCell>{formatAmount(30_000)} USDC</TableCell>
                <TableCell>{formatAmount(20_000)} USDC</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-6.senior')}
                </TableCell>
                <TableCell>{formatAmount(50_000)} USDC</TableCell>
                <TableCell>{formatAmount(40_000)} USDC</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Typography variant='h6' component='span' fontSize={14}>
            {t('modals.termsAndConditions.subheader-6.description-2')}
          </Typography>
          <Table
            size='small'
            border={1}
            sx={(theme) => ({
              borderColor: alpha(theme.palette.text.secondary, 0.1),
              borderRadius: 2,
              overflow: 'hidden',
            })}
          >
            <TableHead>
              <TableRow
                sx={(theme) => ({
                  background: alpha(theme.palette.primary.main, 0.5),
                })}
              >
                <TableCell>{t('general.tranche')}</TableCell>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-6.capacity')}
                </TableCell>
                <TableCell>
                  {t(
                    'modals.termsAndConditions.subheader-6.acceptedDepositRequests'
                  )}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-6.junior')}
                </TableCell>
                <TableCell>{formatAmount(20_000)} USDC</TableCell>
                <TableCell>{formatAmount(20_000)} USDC</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-6.mezzanine')}
                </TableCell>
                <TableCell>{formatAmount(30_000)} USDC</TableCell>
                <TableCell>{formatAmount(30_000)} USDC</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-6.senior')}
                </TableCell>
                <TableCell>{formatAmount(50_000)} USDC</TableCell>
                <TableCell>{formatAmount(50_000)} USDC</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Typography variant='body2' component='span'>
            {t('modals.termsAndConditions.subheader-6.description-3')}
          </Typography>
          <Typography
            variant='h6'
            component='span'
            display='block'
            fontSize={18}
          >
            {t('modals.termsAndConditions.subheader-6.subtitle')}
          </Typography>
          <Typography variant='body2' component='p'>
            {t('modals.termsAndConditions.subheader-6.subtitle-description')}
          </Typography>
          <UnorderedList
            sx={(theme) => ({
              li: {
                ...theme.typography.body2,
                '& + li': {
                  mt: 1,
                },
              },
              pl: 2,
            })}
          >
            <li>{t('modals.termsAndConditions.subheader-6.list-3.list-0')}</li>
            <li>{t('modals.termsAndConditions.subheader-6.list-3.list-1')}</li>
            <li>{t('modals.termsAndConditions.subheader-6.list-3.list-2')}</li>
            <li>{t('modals.termsAndConditions.subheader-6.list-3.list-3')}</li>
          </UnorderedList>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button
          variant='contained'
          startIcon={<ChevronLeftIcon />}
          onClick={handleClose}
          sx={{ width: 130 }}
        >
          {t('general.return')}
        </Button>
      </DialogActions>
    </>
  )
}

export default TermsAndConditionsModal
