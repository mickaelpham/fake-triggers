export function sleepFor(durationInMs: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, durationInMs)
  })
}
