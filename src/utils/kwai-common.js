import request from "./request"
import moment from 'moment'
export async function queryByParam(config){
  const { kwaiType, keywords, campaignId, unitId, ...rest } = config;
  const start = new moment().subtract(0.5,'years');
  let cascade;
  switch (kwaiType){
    case 'campaign':  
      cascade = {
        campaignIdList: [],
        campaignNameKeyWords: [keywords]
      }
      break;
    case 'unit':
      cascade = {
        unitIdList: [],
        unitNameKeyWords: [keywords]
      }
      break;
    case 'creative':
      cascade = {
        creativeIdList: [],
        creativeNameKeyWords: [keywords]
      }
      break;
  }
  const data = {
    'pageNum': 1,
    'pageSize': 1,
    orderByFields: {},
    queryParam: {
      startTime: start.valueOf(),
      endTime: new Date().getTime(),
      timeZone: 'UTC',
      "campaignCascade": {
        "campaignIdList": campaignId? [campaignId]: [],
        "campaignNameKeyWords": []
      },
      "creativeCascade": {
        "creativeIdList": [],
        "creativeNameKeyWords": []
      },
      "unitCascade": {
        "unitIdList": unitId?[unitId]: [],
        "unitNameKeyWords": []
      },
      [`${kwaiType}Cascade`]: cascade
    }
  };

  return request.post({
    url: `https://ads.kwai.com/rest/i18n/adDsp/${kwaiType}/cascade/queryByParam`,
    ...rest,
    body: data
  })
}

export async function campaignsBatchUpdateStatus(key, ids, status){
  const [agent_id, account_id] = key.split('-');
  await request.post({
    url: 'https://ads.kwai.com/rest/i18n/adDsp/campaign/batchUpdateStatus',
    agent_id,
    account_id,
    body: {
      ids: ids,
      putStatus: status
    }
  })
}

export async function unitBatchUpdateStatus(key, ids, status){
  const [agent_id, account_id] = key.split('-');
  await request.post({
    url: 'https://ads.kwai.com/rest/i18n/adDsp/unit/batchUpdateStatus',
    agent_id,
    account_id,
    body: {
      ids: ids,
      putStatus: status
    }
  })
}