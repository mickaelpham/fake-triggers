import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: 'mongodb://localhost:27019/tactivos',
    },
  },
})
