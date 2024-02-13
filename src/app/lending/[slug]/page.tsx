import Container from '@mui/material/Container'

import BackButton from '@/components/atoms/BackButton'
import PageHeader from '@/components/molecules/PageHeader'

const SinglePoolPage = ({ params }: { params: { slug: string } }) => {
  return (
    <Container maxWidth='lg'>
      <PageHeader title={'Pool: ' + params.slug} />
      Pool {params.slug}
      <BackButton />
    </Container>
  )
}

export default SinglePoolPage
