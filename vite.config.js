import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
const isUserPagesRepo = repositoryName.endsWith('.github.io')
const githubPagesBase = process.env.GITHUB_PAGES_BASE ?? `/${repositoryName || 'pf2ecardcreator'}/`

export default defineConfig({
  base:
    process.env.GITHUB_ACTIONS === 'true'
      ? isUserPagesRepo
        ? '/'
        : githubPagesBase
      : '/',
  plugins: [react()],
})
