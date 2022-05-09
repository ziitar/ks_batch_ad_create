<template>
  <div class="Popover" :class="{'show': visible}"  @click.stop="">
    <div v-if="loading" class="loading"></div>
    <div class="flex-start">
      <span style="flex: none">上传数据文件: </span>
      <div v-if="file" class="file-name">
        {{file.fileName}}
        <span class="file-close" @click="handleRemoveFile"></span>
      </div>
      <div v-else>
        <label class="input-file" for="uploadInput">上传xlsx</label>
        <input type="file" accept=".xlsx" id="uploadInput" style="display: none" @change="handleUpload">
      </div>
    </div>
    <div class="flex-start" v-if="json.length">
      <span>读取到{{json.length}}条数据，是否开始搭建计划?</span>
      <span class="input-file" @click="handleStart">开始</span>
    </div>
    <div v-if="res.length" class="message">
      <div v-for="(msg, index) in res" :key="index">{{msg}}</div>
    </div>
    <div class="close" @click="handleClose">
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import { CAMPAIGNS_HEADERS_MAP, CREATIVE_HEADER_MAP, AD_SET_HEADERS_MAP, KWAI_ACCOUNT_MAP, deconStruct } from '../static'
import create from '../utils/create'
export default {
  name: 'Popover',
  props: {
    visible: Boolean
  },
  computed: {
    headers(){
      if(this.json.length){
        return Object.entries(this.json[0]).map(([key])=> key)
      }
      return []
    }
  },
  data: ()=> {
    return {
      file: undefined,
      json: [],
      data: {},
      res: [],
      loading: false
    }
  },
  methods: {
    async handleUpload(e){ 
      if(e.target.files){
        const file = e.target.files.item(0);
        if(file){
          const buffer = await file.arrayBuffer()
          this.file = {
            fileName: file.name,
            arrayBuffer: buffer
          }
          const workbook = XLSX.read(buffer);
          const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])
          this.json = json.filter(item=> (item[KWAI_ACCOUNT_MAP.agentId] && item[KWAI_ACCOUNT_MAP.accountId]));
          const data = {}
          json.forEach((item, index)=> {
            if(data[`${item[KWAI_ACCOUNT_MAP.agentId]}-${item[KWAI_ACCOUNT_MAP.accountId]}`]){
              const campaigns = data[`${item[KWAI_ACCOUNT_MAP.agentId]}-${item[KWAI_ACCOUNT_MAP.accountId]}`];
              let adSet, creative = this.getCreative(item, index);
              let campaign = campaigns.find(campaign=> campaign[CAMPAIGNS_HEADERS_MAP.name] === item[CAMPAIGNS_HEADERS_MAP.name])
              if(campaign){
                const adSets = campaign.adSet;
                adSet = adSets.find(adSet => adSet[AD_SET_HEADERS_MAP.name] === item[AD_SET_HEADERS_MAP.name]);
                if(!adSet){
                  adSet = this.getADSet(item, index);
                  adSet.creative = [creative]
                  campaign.adSet.push(adSet)
                }else {
                  adSet.creative.push(creative)
                  campaign.adSet = adSets.map(adSetItem=> {
                    if(adSetItem[AD_SET_HEADERS_MAP.name] === item[AD_SET_HEADERS_MAP.name]){
                      return adSet
                    }
                    return adSetItem
                  })
                }
                data[`${item[KWAI_ACCOUNT_MAP.agentId]}-${item[KWAI_ACCOUNT_MAP.accountId]}`] = 
                  data[`${item[KWAI_ACCOUNT_MAP.agentId]}-${item[KWAI_ACCOUNT_MAP.accountId]}`].map(campaignItem=> {
                    if(campaignItem[CAMPAIGNS_HEADERS_MAP.name] === item[CAMPAIGNS_HEADERS_MAP.name]){
                      return campaign
                    }
                    return campaignItem
                  })
              }else {
                campaign = this.getCampaign(item, index)
                adSet = this.getADSet(item, index)
                creative = this.getCreative(item, index)
                data[`${item[KWAI_ACCOUNT_MAP.agentId]}-${item[KWAI_ACCOUNT_MAP.accountId]}`].push({
                  ...campaign,
                  adSet: [{
                    ...adSet,
                    creative: [creative]
                  }]
                })
              }
            }else {
              const campaign = this.getCampaign(item, index);
              const adSet = this.getADSet(item, index);
              const creative = this.getCreative(item, index);
              data[`${item[KWAI_ACCOUNT_MAP.agentId]}-${item[KWAI_ACCOUNT_MAP.accountId]}`] = [
                {
                  ...campaign,
                  adSet: [{
                    ...adSet,
                    creative: [creative]
                  }]
                }
              ]
            }
          })
          this.data = data;
          if(json.length === 0){
            this.res.push('xlsx内容为空')
          }
        }
      }
    },
    getCreative(data, index){
      return {
        index: index+2,
        ...deconStruct(CREATIVE_HEADER_MAP, data)
      } 
    },
    getADSet(data, index){
      return {
        index,
        ...deconStruct(AD_SET_HEADERS_MAP, data)
      }
    },
    getCampaign(data, index){
      return {
        index,
        ...deconStruct(CAMPAIGNS_HEADERS_MAP, data)
      }
    },
    handleClose(){
      this.$emit('update:visible',false)
    },
    handleRemoveFile(){
      this.file = undefined;
      this.json = [];
      this.res = [];
      this.loading = false
    },
    async handleStart(){
      this.loading = true
      if(this.data){
        try{
          const result = Object.entries(this.data).map(([key, row])=> create(key, row))
          Promise.all(result).then((res)=> {
            console.log(res, 'res')
          }).catch(err=> {
            console.log(err, 'err')
            if(Array.isArray(err)){
              this.res = this.res.concat(err.map(item=> item?.message||item ))
            }else {
              this.res.push(err?.message||err)
            }
          }).finally(()=>{
             this.res.push('执行完成')
             this.loading = false
          })
        }catch(e){
          console.log(e, 'handleStart')
        }
      }
    }
  }
}
</script>

<style scoped>
.Popover{
  display: none;
  width: 500px;
  height: 600px;
  position: absolute;
  bottom: calc(100% + 4px);
  right: 5px;
  box-shadow: 0 0 10px 2px rgba(66, 185, 133, .3);
  background: #fff;
  z-index: 9999;
  border-radius: 4px;
  text-align: left;
  color: #333;
  padding: 24px;
  box-sizing: border-box;
  line-height: 1.24;
  cursor: default;
}
.show{
  display: block;
}
.input-file{
  display: inline-block;
  height: 30px;
  line-height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  text-align: center;
  padding: 0 12px;
  margin-left: 16px;
}
.file-name{
  line-height: 32px;
  padding-right: 32px;
  padding-left: 16px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
}
.file-name:hover{
  background: #42b9831c;
}
.close{
  position: absolute;
  right: 0;
  top: 0;
  width: 25px;
  height: 25px;
  cursor: pointer;
  border-top-right-radius: 4px; 
  border-bottom-left-radius: 4px; 
}
.close:hover{
  background: #42b983;
}
.close::before{
  content: '';
  position: absolute;
  top: 12px;
  left: 2px;
  width: 20px;
  height: 1px;
  transform: rotate(45deg);
  background: #999;
}
.close:hover::before{
  background: #fff
}
.close::after{
  content: '';
  position: absolute;
  top: 12px;
  left: 2px;
  width: 20px;
  height: 1px;
  transform: rotate(-45deg);
  background: #999;
}
.close:hover::after{
  background: #fff
}
.file-close{
  position: absolute;
  right: 0;
  top: 0;
  width: 32px;
  height: 32px;
  cursor: pointer;
}
.file-close::before{
  content: '';
  position: absolute;
  top: 16px;
  left: 9px;
  width: 14px;
  height: 1px;
  transform: rotate(45deg);
  background: #999;
}
.file-close::after{
  content: '';
  position: absolute;
  top: 16px;
  left: 9px;
  width: 14px;
  height: 1px;
  transform: rotate(-45deg);
  background: #999;
}
.message{
  margin-top: 16px;
  padding: 16px;
  border-top: 1px solid #d9d9d9;
  max-height: 473px;
  overflow: hidden;
  overflow-y: auto;
}
.message div{
  width: 100%;
  white-space: normal;
  word-break: break-all;
}
.loading{
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 2;
}
.loading::after{
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: 1s linear 1s infinite reverse loading;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: 2px solid #42b983;
  border-bottom: unset;
  border-right: unset;
}
@keyframes loading{
  0% {
    transform: rotate(0);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>