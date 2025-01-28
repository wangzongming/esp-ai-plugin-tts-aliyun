# esp-ai-plugin-tts-aliyun [![npm](https://img.shields.io/npm/v/esp-ai-plugin-tts-aliyun.svg)](https://www.npmjs.com/package/esp-ai-plugin-tts-aliyun) [![npm](https://img.shields.io/npm/dm/esp-ai-plugin-tts-aliyun.svg?style=flat)](https://www.npmjs.com/package/esp-ai-plugin-tts-aliyun)

让 ESP-AI 支持阿里云的 `TTS` 服务的插件


阿里云`TTS`服务控制台: https://ai.aliyun.com/nls/tts

开通文档：https://help.aliyun.com/zh/isi/getting-started/start-here?spm=a2c4g.11186623.0.0.cda774c1GbPCap


# 安装
在你的 `ESP-AI` 项目中执行下面命令
```bash
npm i esp-ai-plugin-tts-aliyun
```

# 使用 
```js
const espAi = require("esp-ai"); 

espAi({ 
    // 配置使用插件并且为插件配置api-key
    tts_server: "esp-ai-plugin-tts-aliyun",
    tts_config:{
         // 打开网址获取： https://nls-portal.console.aliyun.com/applist 
            appkey:"xxx",

            // 打开网址获取：https://ram.console.aliyun.com/users
            // AccessKeySecret 在创建时才会有
            AccessKeyID: "xxx",
            AccessKeySecret: "xxx",

            // 音色: https://help.aliyun.com/zh/isi/developer-reference/overview-of-speech-synthesis?spm=a2c4g.11186623.help-menu-30413.d_3_1_0_0.63a718a34jt1PF&scm=20140722.H_84435._.OR_help-T_cn~zh-V_1#5186fe1abb7ag
            voice:"zhiyuan",
    } 

    // 引入插件
    plugins: [ 
        require("esp-ai-plugin-tts-aliyun")
    ], 
});
```

