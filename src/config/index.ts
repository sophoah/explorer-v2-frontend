import { default as bridgeTokens } from "src/config/bridgeTokensMap.json";
import { default as addressAliases } from "src/config/addressAliasMap.json";
import { default as linkedContracts } from "src/config/linkedContractsMap.json";
import { ShardID } from "../types";

interface AddressMap {
  [key: string]: { name: string, link: string, description?: string }
}

const mapKeysToLowerCase = (input: AddressMap): AddressMap => {
  if (typeof input !== 'object') return input;
  return Object.keys(input).reduce(function (newObj: Record<string, any>, key) {
    newObj[key.toLowerCase()] = input[key]
    return newObj;
  }, {});
};

export const bridgeTokensMap: Record<string, string> = bridgeTokens || {}
export const linkedContractsMap: Record<string, { address: string; name: string; type: string; }> = linkedContracts || {}
export const addressAliasMap: AddressMap = mapKeysToLowerCase(addressAliases) || {}

const availableShards = (process.env.REACT_APP_AVAILABLE_SHARDS || '')
    .split(",")
    .map((t) => +t) as ShardID[]

const shardUrls = availableShards
    .map(shardId => process.env[`REACT_APP_RPC_URL_SHARD${shardId}`] as string)
    .filter(url => url)

const contractShardId = +(process.env.REACT_APP_CONTRACT_SHARD || '0') as ShardID
const oneCountryContractAddress = process.env.REACT_APP_ONE_COUNTRY_CONTRACT_ADDRESS || ''
const oneCountryNFTContractAddress = process.env.REACT_APP_ONE_COUNTRY_NFT_CONTRACT_ADDRESS || ''
const ipfsGateway = process.env.REACT_APP_INDEXER_IPFS_GATEWAY || ''

export const config = {
  availableShards,
  shardUrls,
  contractShardId,
  oneCountryContractAddress,
  oneCountryNFTContractAddress,
  ipfsGateway
}
