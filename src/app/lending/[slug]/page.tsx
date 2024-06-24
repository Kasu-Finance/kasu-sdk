import { Container } from '@mui/material'

import PageHeader from '@/components/molecules/PageHeader'
import PoolTabs from '@/components/organisms/lending/PoolTabs'

const SinglePoolPage = ({ params }: { params: { slug: string } }) => {
  return (
    <Container maxWidth='lg'>
      <PageHeader
        title={'Lending Strategy: ' + params.slug}
        poolId={params.slug}
        variant='hero'
      />
      <PoolTabs />
    </Container>
  )
}

export default SinglePoolPage
