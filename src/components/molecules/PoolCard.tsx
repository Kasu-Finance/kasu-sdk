import { Button, Card, Typography } from '@mui/material'
import Link from 'next/link'

interface PoolCardProps {
  name: string
  link: string
}

const PoolCard: React.FC<PoolCardProps> = ({ name, link }) => {
  return (
    <Card>
      <Typography variant='h5'>{name}</Typography>
      <Button href={link} variant='contained' component={Link}>
        Overview
      </Button>
    </Card>
  )
}

export default PoolCard
