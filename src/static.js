export const CAMPAIGNS_HEADERS_MAP = {
  name: 'campaign name',
  budget: 'campaign daily budget',
  status: 'campaign status'
}

export const AD_SET_HEADERS_MAP = {
  name: 'ad set name',
  status: 'ad set status',
  geo: 'geo',
  budget: 'ad set daily budget',
  bid: 'target conversion cost'
}

export const CREATIVE_HEADER_MAP = {
  name: 'ad name',
  slogan: 'slogan',
  description: 'description',
  callToAction: 'call to action',
  playable: 'playable name'
}

export const KWAI_ACCOUNT_MAP = {
  agentId: 'agent id',
  accountId: 'account id'
}

export function deconStruct(map, source){
  return Object.values(map).reduce((result, current)=> {
    result[current] = source[current]
    return result
  }, {})
}