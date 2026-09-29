export const enableMocking = async () => {
  if (typeof window === 'undefined') {
    return
  }

  const { worker } = await import('./browser')

  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  })
}
