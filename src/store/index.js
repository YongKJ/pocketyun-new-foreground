import Vue from "vue"
import Vuex from "vuex"
 
Vue.use(Vuex);
 
export default new Vuex.Store({
    state:{
        baseHost: "cloud.yongkj.cn",
        fileHost: "file.yongkj.cn",
        userSpaceSize: 1 * 1024 * 1024 *1024,  //1GB
        adminSpaceSize: 100 * 1024 * 1024 *1024, //50GB
        userUUID: "",
        userName: "",
        modUserUUID: "",
        register: true,
        setting: true
    },
    mutations:{
      
        saveUserUUID(state, userUUID) {
            state.userUUID = userUUID;
        },
      
        saveUserName(state, userName) {
            state.userName = userName;
        },
      
        saveModUserUUID(state, modUserUUID) {
            state.modUserUUID = modUserUUID;
        },
        
        saveRegister(state, register) {
            state.register = register;
        },
        
        saveSetting(state, setting) {
            state.setting = setting;
        }
      
    }
})