import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material'
import { ReactNode } from 'react'

type WidgetProps = {
  children: ReactNode
  cardAction?: ReactNode
  title?: string
}

const CardWidget: React.FC<WidgetProps> = ({ children, title, cardAction }) => (
  <Card sx={{ mb: 3 }}>
    {title && (
      <CardHeader title={<Typography variant='h6'>{title}</Typography>} />
    )}
    <CardContent sx={{ padding: 2 }}>{children}</CardContent>
    {cardAction && (
      <CardActions sx={{ p: 0, pb: 2, justifyContent: 'center' }}>
        {cardAction}
      </CardActions>
    )}
  </Card>
)

export default CardWidget
