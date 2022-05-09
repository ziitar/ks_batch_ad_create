# ks_batch_ad_create
快手海外广告投放平台批量搭建广告组、广告计划、广告创意的浏览器插件

## 使用
### 编译源码（可选）
copy项目或者[下载源码](https://github.com/ziitar/ks_batch_ad_create/releases/tag/1.0.0),[安装node](https://nodejs.org/zh-cn/download/)和npm。
执行
```shell
  $ npm install
```
安装完依赖后再执行
```sh
  $ npm run build
```
得到dist文件夹
### 直接下载压缩包（可选）
[下载压缩包](https://github.com/ziitar/ks_batch_ad_create/releases/download/1.0.0/dist.zip)。
解压得到dist文件夹

### chrome或者Edge浏览器等
1.打开浏览器扩展程序
2.打开开发者模式 
3.点击加载已解压的扩展程序
4.选择上面步骤得到的dist文件夹
5.去快手海外广告投放平台就能看到走下角侧边半圆，悬浮点击就能看到全貌了

### 配置批量搭建计划模板
打开批量搭建计划模板.xlsx文件，填入对应的字段
| agent id |account id |campaign name|campaign status|campaign daily budget|ad set name|ad set status|geo|ad set daily budget|target conversion cost|ad name|playable name|slogan|description|call to action
|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
|填写代理公司ID|填写账号ID|自定义推广计划名称，同一个账号内不允许名称一致|填写开或者关，开则是保持开启，关则意味着关闭|推广计划预算，如果不限预算则填写为0；其他预算则填写具体的预算内容|自定义广告组的名称|填写开或者关，开则是保持开启，关则意味着关闭|投放的国家地区，使用简写|广告组预算，如果不限预算则填写为0；其他预算则填写具体的预算内容|填写出价，限制四位小数内|填写本次素材名称，目前只支持视频类素材|填写试玩素材的名称|自定义|自定义|自定义行动号召，请保证与后台的内容一致；举例：Play

### 上传建计划
点击扩展程序的上传按钮，选择配置好的excel文件，点击开始。完成后会有执行完成提示。有错误也有提示

### 报错指引

 creative 层级的报错会指出第几行失败+错误信息
 ad set 层级会给ad set 名称+错误信息
 campaigns 层级会给 campaigns 名称+错误信息
以上哪一层级报错 则本条及属于本条的下属层级都不会创建成功
 直接显示错误信息 则基本是以下几类
1.插件首先执行获取 账户下 applist、可选区域、行动号召及优化目标选项，只要一个接口请求有问题或者返回为空，则该账户下所有计划都不执行。
2.快手接口服务繁忙(service busy), 拒绝响应(forbidden) 等。可以稍后重试。
