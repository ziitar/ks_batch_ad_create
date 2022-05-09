
import { queryByParam } from './kwai-common'
import request from "./request"
import { AD_SET_HEADERS_MAP } from '../static'

export async function queryAdSet(key,item){
  const [agent_id, account_id] = key.split('-')
  const res = await queryByParam({
    kwaiType: 'unit',
    keywords: item[AD_SET_HEADERS_MAP.name],
    agent_id: agent_id,
    account_id: account_id,
    campaignId: item.campaignId
  })
  if(res && res.data){
    const data = res.data.find(unit=> (unit.name === item[AD_SET_HEADERS_MAP.name] && unit.campaignId == item.campaignId));
    return data
  }
  return undefined
}

export async function getAppList(key){
  const [agent_id, account_id] = key.split('-');
  const res = await request.post({
    url: 'https://ads.kwai.com/rest/i18n/adDsp/app/info/list',
    agent_id,
    account_id,
    body: {
      "queryParam": {
        "searchKey": ""
      },
      "pageSize": 30,
      "pageNum": 1
    }
  });
  if(res && res.data){
    return res.data[0]
  }
  throw new Error('未找到APP,请先配置APP')
}

export async function getOptimizationList(key){
  const [agent_id, account_id] = key.split('-');
  const res = await request.post({
    url: 'https://ads.kwai.com/rest/i18n/adDsp/unit/routeConvList',
    agent_id,
    account_id,
    body: {
      "campaignType": 3,
      "deliveryStrategy": 0,
      "marketingType": 1,
      "extendMap": {}
    }
  });
  if(res){
    const conversion = res.conversionGoal.find(item=> (item.name === 'Activiation' && item.lightUp))
    if(conversion){
      const bidType = conversion.bidType.find(item=> (item.name === 'OCPM' && item.lightUp));
      return {
        conversion,
        bidType
      }
    }
  }
  throw new Error('没有可用的优化目标')
}

export async function getLocation(key){
  const [agent_id, account_id] = key.split('-');
  const res = await request.post({
    url: 'https://ads.kwai.com/rest/i18n/adDsp/target/pollTargetLabelAndTree',
    agent_id,
    account_id,
  })
  if(res){
    const location = res.find(item=> item.targetLabel.targetLabelName === 'location');
    if(location){
      return location.labelTreeList
    }
  }
  throw new Error('获取地区数据失败')
}

export async function getSelectableCountry(key){
  const [agent_id, account_id] = key.split('-');
  const res = await request.post({
    url: 'https://ads.kwai.com/rest/i18n/adDsp/target/getSelectableCountry',
    agent_id,
    account_id,
  })
  if(res){
    return res
  }
  throw new Error('获取可选地区失败')
}

export async function createADSet(key, item, app){
  const [agent_id, account_id] = key.split('-');
  const budget = Number(item[AD_SET_HEADERS_MAP.budget] || 0),
    bid = Number(item[AD_SET_HEADERS_MAP.bid]);
  if(isNaN(budget) || (budget!==0 && (budget< 80 || budget > 15000000))){
    throw new Error(`${item[AD_SET_HEADERS_MAP.name]}budget 只能为空或者为大于80、小于15000000的数值`)
  }
  if(isNaN(bid) || bid <= 0){
    throw new Error(`${item[AD_SET_HEADERS_MAP.name]}bid 只能为大于0的数值`)
  }
  const res = await request.post({
    url: 'https://ads.kwai.com/rest/i18n/adDsp/unit/add',
    agent_id,
    account_id,
    body: {
      age: [],
      appAvatar: app.appAvatar,
      appAvatarBlobstoreKey: app.appAvatarBlobstoreKey,
      appId: app.appId,
      appPackageName: app.appPackageName,
      bid: Math.floor(bid * 1000000),
      bidType: item.bidType,
      budgetSchedule: [],
      campaignId: item.campaignId,
      countryIdList: [],
      countryRegionList: item.countryRegionList.map(item=> ({countryRegionId: item.code, countryRegionName: item.name})),
      dayBudget: Math.floor(budget * 1000000),
      deviceBrand: [],
      devicePrice: [],
      endTime: 0,
      gender: 0,
      language: [],
      name: item[AD_SET_HEADERS_MAP.name],
      ocpxActionType: item.ocpxActionType,
      platform: [
        {
            deviceType: "android",
            osVersionList: [
                {
                    osVersion: "os_version>android>5.0",
                    osVersionTitle: "Android5.0及以上"
                }
            ]
        }
      ],
      provider: app.provider,
      startTime: new Date().getTime(),
      traceType: 1,
      traceUrlId: app.traceId
    }
  })
  if(res){
    return res.id
  }
  throw new Error(`${item[AD_SET_HEADERS_MAP.name]}`+'ad set 创建失败')
}