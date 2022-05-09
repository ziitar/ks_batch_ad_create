import { queryCallToAction, getVideoList, createCreative, imageResultWithCompress, getPlayList } from './kwai-adCreative'
import { queryAdSet, getAppList, getOptimizationList, getLocation, getSelectableCountry, createADSet, } from './kwai-adSet'
import { queryCampaigns, createCampaigns } from './kwai-campaigns'
import { AD_SET_HEADERS_MAP, CAMPAIGNS_HEADERS_MAP, CREATIVE_HEADER_MAP } from '../static'
import locationMap  from './data.json'
import { KwaiError } from './util'
import { campaignsBatchUpdateStatus, unitBatchUpdateStatus } from './kwai-common'

async function createAD(key, row, campaign, unit, extra){
  const videos = await getVideoList(key, row);
    if(videos){
      const video = videos[0];
      if(video){
        const { app, action, blobKeyWithTransform, playList} = extra;
        const ctaKey = action.find(item=> item.name == row[CREATIVE_HEADER_MAP.callToAction])
        let playableMate;
        if(row[CREATIVE_HEADER_MAP.playable]){
          if(playList && playList.length){
            playableMate = playList.find(playable=> playable.playableName == row[CREATIVE_HEADER_MAP.playable])
            if(!playableMate){
              throw new Error(`第${row.index}行失败，失败原因：${CREATIVE_HEADER_MAP.playable}不存在试玩素材库里`)
            }
          }else {
            throw new Error(`第${row.index}行失败，失败原因：${CREATIVE_HEADER_MAP.playable}不存在试玩素材库里`)
          }
        }
        if(ctaKey){
          const creativeId = await createCreative(key, {
            ...row,
            unitId: unit.id,
            campaignId: campaign.id,
            blobKeyWithTransform: blobKeyWithTransform,
            ctaKey: ctaKey.code,
          }, app, video, playableMate)
          if(creativeId){
            return creativeId
          }
        }else {
          throw new Error(`第${row.index}行失败，失败原因：${CREATIVE_HEADER_MAP.callToAction}非法`)
        }
      }else {
        throw new Error(`第${row.index}行失败，失败原因：${CREATIVE_HEADER_MAP.name}找不到对应素材`)
      }
    }
}

async function createUnit(key, row, campaign, extra) {
  const unitExisted = await queryAdSet(key, { ...row, campaignId: campaign.id});
  const { 
    app, 
    countryRegionList, 
    optimization,
   } = extra;
  const regionList = countryRegionList.filter(item=> {
    if(item.name === row[AD_SET_HEADERS_MAP.geo]){
      return true
    }else if(locationMap[row[AD_SET_HEADERS_MAP.geo]] === item.name){
      return true
    }
    return false
  })
  if(regionList.length === 0){
    throw new Error(`${row[AD_SET_HEADERS_MAP.name]}的 ${AD_SET_HEADERS_MAP.geo}字段填写错误，找不到对应地区`)
  }
  const errors = [];
  let needOffId;
  if(!unitExisted){
    let unitId = await createADSet(key, {
      ...row,
      campaignId: campaign.id,
      bidType: optimization.bidType.code,
      ocpxActionType: optimization.conversion.code,
      countryRegionList: regionList
    }, app)
    if(unitId){
      if(row[AD_SET_HEADERS_MAP.status] === '关'){
        needOffId = unitId
      }
      for(const item of row.creative){
        try{
          await createAD(key, { ...item}, campaign, { ...row, id: unitId}, extra)
        }catch(e){
          errors.push(e)
        }
      }
    }
  }else {
    for(const item of row.creative){
      try{
        await createAD(key, { ...item}, campaign, { ...row, id: unitExisted.unitId}, extra)
      }catch(e){
        errors.push(e)
      }
    }
  }
  if(errors.length){
    const throwErrors = errors.flat();
    if(needOffId){
      throwErrors.push(new KwaiError('needOffId', 'unit', [needOffId]))
    }
    throw throwErrors
  }
  return needOffId
}

async function createCampaign(key, row, extra){
  const campaignExisted = await queryCampaigns(key, row);
  const errors = [], needOffIds = {
    campaign: undefined,
    units: []
  };
  if(!campaignExisted){
    let campaignId = await createCampaigns(key, row);
    if(campaignId){
      if(row[CAMPAIGNS_HEADERS_MAP.status] === '关'){
        needOffIds.campaign = campaignId
      }
      for(const item of row.adSet){
        try{
          const unitId = await createUnit(key,{...item}, {...row, id: campaignId}, extra)
          if(unitId){
            needOffIds.units.push(unitId)
          }
        }catch(e){
          errors.push(e)
        }
      }
    }
  }else {
    for(const item of row.adSet){
      try{
        const unitId = await createUnit(key,{...item}, {...row, id: campaignExisted.campaignId}, extra)
        if(unitId){
          needOffIds.units.push(unitId)
        }
      }catch(e){
        errors.push(e)
      }
    }
  }
  
  if(errors.length){
    const throwErrors = errors.flat();
    if(needOffIds.campaign){
      throwErrors.push(new KwaiError('needOffIds','campaign', [needOffIds.campaign]))
    }
    if(needOffIds.units.length){
      throwErrors.push(new KwaiError('needOffIds', 'unit', needOffIds.units))
    }
    throw throwErrors
  }
  return needOffIds
}

export default async (key, row)=> {
  let app, optimization, location, selectableCountry, action, blobKeyWithTransform,playList;
  app = await getAppList(key);
  optimization = await getOptimizationList(key);
  location = await getLocation(key);
  selectableCountry = await getSelectableCountry(key);
  action =  await queryCallToAction(key);
  playList =  await getPlayList(key);
  blobKeyWithTransform = await imageResultWithCompress(key, app)
  const countryRegionList = location.filter(item=> selectableCountry.includes(item.code))
  if(countryRegionList.length === 0){
    throw new Error(key + '当前账号可选的地区为空')
  }
  const errors = [];
  const needOffIds = {
    campaigns: [],
    units: []
  };
  const extra = {
    app,
    action,
    blobKeyWithTransform,
    countryRegionList,
    optimization,
    playList
  }
  for(const item of row){
    try{
      const ids = await createCampaign(key, item, extra)
      if(ids.campaign){
        needOffIds.campaigns.push(ids.campaign)
      }
      if(ids.units){
        needOffIds.units = needOffIds.units.concat(ids.units)
      }
    }catch(e){
      if(Array.isArray(e)){
        e.forEach(err=> {
          if(err instanceof KwaiError){
            if(err.type === 'campaign'){
              needOffIds.campaigns = needOffIds.campaigns.concat(err.offIds)
            }else if(err.type === 'unit'){
              needOffIds.units = needOffIds.units.concat(err.offIds)
            }
          }else {
            errors.push(err)
          }  
        })
      }else {
        if(e instanceof KwaiError){
          if(e.type === 'campaign'){
            needOffIds.campaigns = needOffIds.campaigns.concat(e.offIds)
          }else if(e.type === 'unit'){
            needOffIds.units = needOffIds.units.concat(e.offIds)
          }
        }else {
          errors.push(e)
        }
      }
    }
  }
  if(needOffIds.campaigns.length){
    try{
      await campaignsBatchUpdateStatus(key, needOffIds.campaigns, 2)
    }catch(e){
      errors.push(e)
    }
  }
  if(needOffIds.units.length){
    try{
      await unitBatchUpdateStatus(key, needOffIds.units, 2)
    }catch(e){
      errors.push(e)
    }
  }
  if(errors.length){
    throw errors.flat()
  }
}