import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LoadingState } from './components/common/StateViews'
import { Layout } from './components/layout/Layout'
import { AuthProvider } from './context/AuthContext'
import { theme } from './theme'

// Route-level code splitting keeps the initial bundle small.
const HomePage = lazy(() => import('./pages/HomePage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const SignInPage = lazy(() => import('./pages/SignInPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<LoadingState />}>{element}</Suspense>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: 'product/:slug', element: withSuspense(<ProductPage />) },
      { path: 'signin', element: withSuspense(<SignInPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
])

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}
