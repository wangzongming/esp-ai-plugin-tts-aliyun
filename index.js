const Nls = require('alibabacloud-nls')
const RPCClient = require('@alicloud/pop-core').RPCClient;



/**
 * esp-ai TTS 插件开发 
*/
module.exports = {
    // 插件名字
    name: "esp-ai-plugin-tts-aliyun",
    // 插件类型 LLM | TTS | IAT
    type: "TTS",
    /**
     * TTS 插件封装 
     * @param {String}      device_id           设备ID   
     * @param {String}      text                待播报的文本   
     * @param {Object}      tts_config          用户配置的 apikey 等信息    
     * @param {String}      iat_server          用户配置的 iat 服务 
     * @param {String}      llm_server          用户配置的 llm 服务 
     * @param {String}      tts_server          用户配置的 tts 服务 
     * @param {Number}      devLog              日志输出等级，为0时不应该输出任何日志   
     * @param {Function}    tts_params_set      用户自定义传输给 TTS 服务的参数，eg: tts_params_set(参数体)
     * @param {Function}    logWSServer         将 ws 服务回传给框架，如果不是ws服务可以这么写: logWSServer({ close: ()=> { 中断逻辑... } })
     * @param {Function}    ttsServerErrorCb    与 TTS 服务之间发生错误时调用，并且传入错误说明，eg: ttsServerErrorCb("意外错误")
     * @param {Function}    cb                  TTS 服务返回音频数据时调用，eg: cb({ audio: 音频base64, ... })
     * @param {Function}    log                 为保证日志输出的一致性，请使用 log 对象进行日志输出，eg: log.error("错误信息")、log.info("普通信息")、log.tts_info("tts 专属信息")
    */
    async main({ device_id, text, devLog, tts_config, logWSServer, tts_params_set, cb, log, ttsServerErrorCb, connectServerCb, connectServerBeforeCb }) {
        try {
            const config = { ...tts_config }
            function genToekn() {
                return new Promise((resolve) => {
                    const client = new RPCClient({
                        accessKeyId: config.AccessKeyID,
                        accessKeySecret: config.AccessKeySecret,
                        endpoint: 'https://nls-meta.cn-shanghai.aliyuncs.com',
                        apiVersion: '2019-02-28'
                    });
                    client.request('CreateToken').then((result) => {
                        config.token = result.Token.Id;
                        resolve();
                        // console.log(result)
                        // console.log("token = " + result.Token.Id)
                        // console.log("expireTime = " + result.Token.ExpireTime)
                    });
                })
            }


            await genToekn();
            connectServerBeforeCb();
            const tts = new Nls.SpeechSynthesizer({
                url: "wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1",
                appkey: config.appkey,
                token: config.token,
            })
            connectServerCb(true);
            const wss = {
                close: () => {
                    // throw Error("中断TTS服务")
                }
            }
            logWSServer(wss);
            tts.on("data", (msg) => {
                cb({
                    // 根据服务控制
                    is_over: false,
                    audio: Buffer.from(msg, 'base64'),
                    ws: wss
                });
            })

            tts.on("completed", (msg) => {
                cb({
                    // 根据服务控制
                    is_over: true,
                    audio: "",
                    ws: wss
                });
            })

            // tts.on("closed", () => {
            //     console.log("Client recv closed")
            // }) 
            tts.on("failed", (msg) => {
                ttsServerErrorCb(`tts错误: ${msg}`)
            })

            const param = tts.defaultStartParams()
            param.format = "mp3"
            param.text = text
            param.voice = config.voice || "zhiyuan"
            param.volume = 100;
            param.sample_rate = 48000;


            try {
                tts.start(tts_params_set ? tts_params_set(param) : param, true, 6000)
            } catch (error) {
                ttsServerErrorCb(`tts错误: ${error}`)
            } finally {

            }
        } catch (err) {
            connectServerCb(false);
            log.error(`阿里云 TTS 错误： ${err}`)
        }

    }
}
