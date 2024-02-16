import { Container } from '@mui/material'

import PageHeader from '@/components/molecules/PageHeader'
import LendingTabs from '@/components/organisms/lending/LendingTabs'

const SinglePoolPage = ({ params }: { params: { slug: string } }) => {
  return (
    <Container maxWidth='lg'>
      <PageHeader title={'Pool: ' + params.slug} />
      Pool {params.slug}
      <LendingTabs />
    </Container>
  )
}

export default SinglePoolPage
