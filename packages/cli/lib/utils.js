import { readFileSync } from 'fs'

export function readContractABI(path) {
  const file = readFileSync(path, 'utf8')
  const json = JSON.parse(file)
  return json.abi
}

export function readContractAddress(path) {
  const file = readFileSync(path, 'utf8')
  const json = JSON.parse(file)
  const transactions = json.transactions
  return transactions[0].contractAddress
}
