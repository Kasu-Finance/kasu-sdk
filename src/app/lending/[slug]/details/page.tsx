type PageProps = {
  params: {
    slug: string
  }
}

const PoolDetailPage = ({ params }: PageProps) => {
  return 'detail page' + params.slug
}

export default PoolDetailPage
