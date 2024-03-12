import { Container } from '@mui/material'

import Carousel from '@/components/molecules/Carousel'
import PageHeader from '@/components/molecules/PageHeader'
import PoolCard from '@/components/molecules/PoolCard'

const LENDING_POOLS = [
  {
    name: 'Pool 1',
    link: 'lending/1',
  },
  {
    name: 'Pool 2',
    link: 'lending/2',
  },
  {
    name: 'Pool 3',
    link: 'lending/pool-3',
  },
  {
    name: 'Pool 4',
    link: 'lending/pool-4',
  },
  {
    name: 'Pool 5',
    link: 'lending/pool-5',
  },
  {
    name: 'Pool 6',
    link: 'lending/pool-6',
  },
]

const Lending = () => {
  return (
    <Container maxWidth='lg'>
      <PageHeader title='Lending' />

      <Carousel slidesPerPage={3}>
        {LENDING_POOLS.map((pool, index) => (
          <PoolCard name={pool.name} link={pool.link} key={index} />
        ))}
      </Carousel>
    </Container>
  )
}

export default Lending
