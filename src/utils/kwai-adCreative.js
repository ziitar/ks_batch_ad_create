
import { queryByParam } from './kwai-common'
import request from "./request"
import { CREATIVE_HEADER_MAP } from '../static'

export async function queryAdCreative(key,item){
  const [agent_id, account_id] = key.split('-')
  const res = await queryByParam({
    kwaiType: 'creative',
    keywords: item[CREATIVE_HEADER_MAP.name],
    agent_id: agent_id,
    account_id: account_id,
    campaignId: item.campaignId,
    unitId: item.unitId
  })
  if(res && res.data){
    const data = res.data.find(creative=> (creative.name === item[CREATIVE_HEADER_MAP.name] && creative.unitId == item.unitId && creative.campaignId == item.campaignId));
    return data
  }
  return undefined
}

export async function queryCallToAction(key){
  const [agent_id, account_id] = key.split('-')
  const res = await request.post({
    url: 'https://ads.kwai.com/rest/i18n/adDsp/creative/ctaList',
    agent_id: agent_id,
    account_id: account_id,
  })
  if(res && res.ctaList){
    return res.ctaList.map(item=> ({name: item.value, code: item.key}))
  }
  throw new Error('未获取到行动号召数据')
}

export async function getVideoList(key, item){
  const [agent_id, account_id] = key.split('-')
  const res = await request.post({
    url: 'https://ads.kwai.com/rest/i18n/adDsp/photo/list',
    agent_id: agent_id,
    account_id: account_id,
    body: {
      pageNum: 1,
      pageSize: 60,
      queryParam: {
        searchKey: item[CREATIVE_HEADER_MAP.name]
      },
      orderByFields: {
        createTime: false
      }
    }
  })
  if(res){
    if(res.data){
      return res.data
    }
  }
  throw new Error(`第${item.index}行失败，失败原因： `+`找不到对应的视频名称-${item[CREATIVE_HEADER_MAP.name]}`)
}

export async function getPlayList(key){
  const [agent_id, account_id] = key.split('-')
  const res = await request.post({
    url: 'https://ads.kwai.com/rest/i18n/adDsp/playable/query/acctPlayList',
    agent_id: agent_id,
    account_id: account_id,
    body: {}
  })
  if(res){
    return res
  }
  return undefined
}

export async function getAppInfo(key, item){
  const [agent_id, account_id] = key.split('-')
  const res = await request.post({
    url: 'https://ads.kwai.com/rest/i18n/adDsp/app/info/detail',
    agent_id: agent_id,
    account_id: account_id,
    body: {
      appId: item.appId
    }
  })
  if(res){
    return res
  }
  throw new Error('未找到对应APP')
}

export async function imageResultWithCompress(key, app){
  const [agent_id, account_id] = key.split('-')
  const res = await request.post({
    url: 'https://ads.kwai.com/rest/i18n/adDsp/common/upload/token/imageResultWithCompress',
    agent_id: agent_id,
    account_id: account_id,
    body: {
      blobstoreKey: app.appAvatarBlobstoreKey
    }
  })
  if(res && res.resultWithTransformView){
    return res.resultWithTransformView.blobKeyWithTransform
  }
  throw new Error('未能转化APP图标')
}

export async function createCreative(key, item, app, video, playableMate){
  const [agent_id, account_id] = key.split('-')
  try {
    const res = await request.post({
      url: 'https://ads.kwai.com/rest/i18n/adDsp/creative/add',
      agent_id: agent_id,
      account_id: account_id,
      body: {
        unitId: item.unitId,
        campaignId: item.campaignId,
        advertiserName: app.appName,
        avatarBlobstoreKey: item.blobKeyWithTransform,
        clickUrl: app.clickUrl,
        impressionUrl: app.impressionUrl,
        creativeContents: [
          {
            materialType: 1,
            name: item[CREATIVE_HEADER_MAP.name],
            desc: item[CREATIVE_HEADER_MAP.description],
            subTitle: item[CREATIVE_HEADER_MAP.slogan],
            ctaKey: item.ctaKey,
            photoId: video.photoId,
            photoBlobstoreKey: video.photoBlobStoreKey,
            goodsViews: [],
            multiPicViews: [],
            bigPicViews: [],
            anchorPointViews: [],
            playableId: playableMate && playableMate.playableId
          }
        ]
      }
    })
    if(res){
      return res.id
    }
  }catch(e){
    throw new Error(`第${item.index}行失败，失败原因： ${e?.message || e}`)
  }
}

