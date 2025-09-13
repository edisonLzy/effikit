import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('extension').FileConfig} */
const config = {
    config: (config) => {
      config.resolve.alias = {
        '@': path.resolve(__dirname, 'src')
      }
      return config
    }
  }
  
  export default config