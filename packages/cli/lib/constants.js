import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const CONTRACT_DIR = join(__dirname, '../../..')
export const CONTRACT_NAME = 'BlindChaosSwarm'
