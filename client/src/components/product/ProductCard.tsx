import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { memo } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { formatPrice } from '../../utils/format'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
}

function ProductCardComponent({ product }: ProductCardProps) {
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : null

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        transition: 'transform 160ms ease, border-color 160ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'primary.main',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '&:hover': { transform: 'none' },
        },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/product/${product.id}`}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ position: 'relative', bgcolor: '#0d1220' }}>
          <Box
            component="img"
            src={product.image}
            alt={product.name}
            width={400}
            height={300}
            loading="lazy"
            sx={{ width: '100%', height: 'auto', display: 'block' }}
           />
          {discount ? (
            <Chip
              label={`-${discount}%`}
              color="secondary"
              size="small"
              sx={{ position: 'absolute', top: 10, left: 10 }}
             />
          ) : null}
        </Box>

        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
            width: '100%',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {product.brand} · {product.category}
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {product.name}
          </Typography>

          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Rating
              value={product.ratingAverage}
              precision={0.1}
              size="small"
              readOnly
             />
            <Typography variant="caption" color="text.secondary">
              {product.ratingCount > 0
                ? `${product.ratingAverage.toFixed(1)} (${product.ratingCount})`
                : 'No reviews'}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1} sx={{ alignItems: 'baseline', mt: 'auto', pt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {formatPrice(product.price)}
            </Typography>
            {product.originalPrice ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                {formatPrice(product.originalPrice)}
              </Typography>
            ) : null}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export const ProductCard = memo(ProductCardComponent)
