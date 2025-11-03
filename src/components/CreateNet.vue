<script setup lang="ts">
const icons = inject('icons') as Record<string, string>
const openBrowser = () => {
  window.nodeAPI.openBrowser('https://my.zerotier.com/')
}
</script>
<template>
  <div class="create-net">
    <div class="tab-item" @click="openBrowser">
      <div>Create on Official Platform</div>
      <div class="info">
        <!-- <img :src="icons.chrome"  /> -->
        <div>
          <span class="green">Admin Token</span>
          How to get:
        </div>
        <div>1. Register and login</div>
        <div>
          2. Click on
          <span class="green">Account</span>
          in the upper right corner
        </div>
        <div>
          3. Click
          <span class="green">New Token</span>
        </div>
        <span class="red" style="margin: 3rem 0 0;">Local proxy creation feature in development</span>
      </div>
    </div>
    <div class="tab-item disable">
      <div>Create Locally</div>
      <div class="info red">In Development</div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.create-net {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100%;

  .tab-item {
    width: 35%;
    display: flex;
    align-items: center;
    height: 45vh;
    flex-direction: column;
    background-color: #333333;
    border-radius: 10px;
    padding: 1rem;
    cursor: pointer;
    font-size: 1.2rem;
    transition: box-shadow .3s;
    &:hover{
      box-shadow: 1px 1px 5px 1px #71d8ffa6;
    }

    &.disable {
      cursor: not-allowed;

    }

    .info {
      flex-grow: 1;
      display: flex;
      // align-items: center;
      justify-content: center;
      flex-direction: column;
    }
  }

  .green {
    color: #19A974;
  }

  .red {
    color: red;
  }
}
</style>
