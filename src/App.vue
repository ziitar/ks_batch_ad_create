<template>
  <div class="extension-app" :class="{'extension-app-focus': visible}" @click="handleChange(!visible)">
    {{visible? '点击关闭弹框':'点击批量建计划'}}
    <popover :visible.sync="visible"/>
  </div>
</template>

<script>
import Popover from '@/components/Popover' 
export default {
  name: 'App',
  components: {
    Popover
  },
  data: function() {
    return {
      visible: false 
    } 
  },
  methods: {
    handleChange(flag) {
      this.visible = flag
    }
  }
}
</script>

<style>
.flex-start{
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<style scoped >
.extension-app{
  position: fixed;
  right: 0;
  bottom: 150px;
  width: 150px;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
  background: #42b983;
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  transform: translateX(134px);
  transition: transform 0.3s ease-in-out ;
  text-align: right;
  padding-right: 24px;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  z-index: 9999;
}
.extension-app:hover{
  transform: translateX(0);
}
.extension-app-focus{
  transform: translateX(0);
}
</style>
