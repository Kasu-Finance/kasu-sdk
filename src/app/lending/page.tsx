import { Card, Grid } from '@mui/material'
import Container from '@mui/material/Container'
import Link from 'next/link'

import PageHeader from '@/components/molecules/PageHeader'

const Lend = () => {
  return (
    <Container maxWidth='lg'>
      <PageHeader title='Lending' />

      <Grid>
        <Grid item>
          <Card> Pool 1</Card>
          <Link href='lending/pool-1'>navigation</Link>
        </Grid>
        <Grid item>
          <Card> Pool 2</Card>
          <Link href='lending/pool-2'>navigation</Link>
        </Grid>
        <Grid item>
          <Card> Pool 3</Card>
          <Link href='lending/pool-3'>navigation</Link>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Lend
