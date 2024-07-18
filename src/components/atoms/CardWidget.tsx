import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  SxProps,
  Theme,
  Typography,
} from '@mui/material'
import { ReactNode } from 'react'

type WidgetProps = {
  children: ReactNode
  cardAction?: ReactNode
  title?: string
  cardSx?: SxProps<Theme>
}

const CardWidget: React.FC<WidgetProps> = ({
  children,
  title,
  cardAction,
  cardSx,
}) => (
  <Card
    sx={[
      (theme) => ({
        mb: 3,
        [theme.breakpoints.down('sm')]: {
          mb: 0,
        },
      }),
      ...(Array.isArray(cardSx) ? cardSx : [cardSx]),
    ]}
  >
    {title && (
      <CardHeader
        title={
          <Typography variant='h6' fontSize={{ xs: 16, sm: 20 }}>
            {title}
          </Typography>
        }
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            height: 42,
            p: 1,
          },
        })}
      />
    )}
    <CardContent
      sx={(theme) => ({
        padding: 2,
        [theme.breakpoints.down('sm')]: {
          p: 1,
        },
      })}
    >
      {children}
    </CardContent>
    {cardAction && (
      <CardActions sx={{ p: 0, pb: 2, justifyContent: 'center' }}>
        {cardAction}
      </CardActions>
    )}
  </Card>
)

export default CardWidget
