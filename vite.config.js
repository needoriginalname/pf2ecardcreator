import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
const isUserPagesRepo = repositoryName.endsWith('.github.io')

export default defineConfig({
  base:
    process.env.GITHUB_ACTIONS === 'true'
      ? isUserPagesRepo
        ? '/'
        : `/${repositoryName}/`
      : '/',
  plugins: [react()],
})
