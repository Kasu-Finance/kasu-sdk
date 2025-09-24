import { Button } from '@mui/material'

const AdditionalInformation = () => (
  <>
    <Button
      href='https://docs.kasu.finance/'
      target='_blank'
      rel='noopener noreferrer'
      sx={{
        width: 'max-content',
        height: 'max-content',
        p: 0,
        textTransform: 'capitalize',
      }}
    >
      User Docs
    </Button>
    <Button
      href='https://docs.kasu.finance/important-information-when-lending/frequently-asked-questions'
      target='_blank'
      rel='noopener noreferrer'
      sx={{
        width: 'max-content',
        height: 'max-content',
        p: 0,
        textTransform: 'capitalize',
      }}
    >
      FAQs
    </Button>
    <Button
      href='https://kasu.finance/'
      target='_blank'
      rel='noopener noreferrer'
      sx={{
        width: 'max-content',
        height: 'max-content',
        p: 0,
        textTransform: 'capitalize',
      }}
    >
      Website
    </Button>
    <Button
      href='mailto:hello@kasu.finance'
      rel='noopener noreferrer'
      sx={{
        width: 'max-content',
        height: 'max-content',
        p: 0,
        textTransform: 'capitalize',
      }}
    >
      Contact Us
    </Button>
  </>
)
export default AdditionalInformation
