
import { queryByParam } from './kwai-common'
import request from "./request"
import { CAMPAIGNS_HEADERS_MAP } from '../static'

export async function queryCampaigns(key,item){
  const [agent_id, account_id] = key.split('-')
  const res = await queryByParam({
    kwaiType: 'campaign',
    keywords: item[CAMPAIGNS_HEADERS_MAP.name],
    agent_id: agent_id,
    account_id: account_id
  })
  if(res && res.data){
    const data = res.data.find(campaign=> campaign.name === item[CAMPAIGNS_HEADERS_MAP.name]);
    return data
  }
  return undefined
}

export async function createCampaigns(key, item){
  const [agent_id, account_id] = key.split('-');
  const budget = Number(item[CAMPAIGNS_HEADERS_MAP.budget] || 0)
  if(isNaN(budget) || (budget!==0 && (budget< 80 || budget > 15000000))){
    throw new Error(`${item[CAMPAIGNS_HEADERS_MAP.name]} budget 只能为空或者为大于80、小于15000000的数值`)
  }
  const res = await request.post({
    url: 'https://ads.kwai.com/rest/i18n/adDsp/campaign/add',
    agent_id,
    account_id,
    body: {
      campaignType: 3,
      marketingType: 1,
      name: item[CAMPAIGNS_HEADERS_MAP.name],
      deliveryStrategy: 0,
      budgetSchedule: [],
      dayBudget: Math.floor(budget * 1000000)
    }
  })
  if(res){
    return res.id
  }
  throw new Error(`${item[CAMPAIGNS_HEADERS_MAP.name]}`+'campaigns 创建失败')
}