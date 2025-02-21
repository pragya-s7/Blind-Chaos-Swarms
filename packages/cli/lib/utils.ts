import { readFileSync, existsSync } from 'fs'

export function readContractABI(path: string) {
  if (!existsSync(path)) {
    throw new Error(`ABI file not found at ${path}`)
  }
  try {
    const file = readFileSync(path, 'utf8')
    const json = JSON.parse(file)
    if (!json.abi) {
      throw new Error('No ABI found in contract artifact')
    }
    return json.abi
  } catch (error) {
    console.error('Error reading ABI:', error)
    throw error
  }
}

export function readContractAddress(path: string) {
  if (!existsSync(path)) {
    throw new Error(`Broadcast file not found at ${path}`)
  }
  try {
    const file = readFileSync(path, 'utf8')
    const json = JSON.parse(file)
    const transactions = json.transactions
    if (!transactions?.[0]?.contractAddress) {
      throw new Error('No contract address found in broadcast file')
    }
    return transactions[0].contractAddress
  } catch (error) {
    console.error('Error reading contract address:', error)
    throw error
  }
}
