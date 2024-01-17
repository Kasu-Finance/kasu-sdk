import { Paper, Typography } from '@mui/material'

type PageHeaderProps = {
  title: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => (
  <Paper sx={{ padding: 2 }}>
    <Typography variant='h5' component='h1'>
      {title}
    </Typography>
  </Paper>
)

export default PageHeader
