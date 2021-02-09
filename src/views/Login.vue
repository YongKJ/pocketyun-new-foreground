<template>

    <div id="login">
      
      <vue-particles
        color="#ffffff"
        :particleOpacity="0.7"
        :particlesNumber="50"
        shapeType="circle"
        :particleSize="3"
        linesColor="#E6E6FA"
        :linesWidth="1"
        :lineLinked="true"
        :lineOpacity="0.6"
        :linesDistance="150"
        :moveSpeed="6"
        :hoverEffect="true"
        hoverMode="grab"
        :clickEffect="true"
        clickMode="push"
      >
      </vue-particles>
      
      <el-form class="login-container" label-position="left" label-width="0px">
        <h3 class="login_title">袖珍网盘吧</h3>
        <el-form-item style="user-select: none;">
          <el-input type="text" v-model="userName" placeholder="请输入邮箱地址或用户名..."></el-input>
        </el-form-item>

        <el-form-item style="user-select: none;">
          <el-input type="password" v-model="password" placeholder="请输入密码..."></el-input>
        </el-form-item>
        
        <el-form-item style="user-select: none;">
          <el-input style="width: 58%" type="text" @keyup.enter.native="userLogin()" v-model="validCode" placeholder="请输入验证码..."></el-input>
          <valid-code ref="validCode" style="float: right;background-color: #f8f9fa;border-radius: 5px;"></valid-code>
        </el-form-item>

        <el-form-item style="width: 100%">
          <el-button type="primary" style="width: 100%;background: #4169E1;border: none" @click="userLogin()">登录</el-button>
        </el-form-item>
        
        <el-form-item style="width: 100%">
          <el-button type="primary" class="button-border" @click="goRegister()">还没有账号？</el-button>
        </el-form-item>
        
        <el-form-item style="width: 100%">
          <el-button type="primary" class="button-border-red" @click="retrievePassword()">忘记密码？</el-button>
        </el-form-item>
      </el-form>
      
    </div>

</template>

<script>

import ValidCode from '../components/ValidCode'
  
export default {
  name: 'login',
  data() {
    return {
      baseHost: '',
      userName: '',
      password: '',
      validCode: ''
    }
  },
  components: {
    ValidCode
  },
  mounted() {
    this.baseHost = this.$store.state.baseHost;
    this.judgeUserCookies();
  },
  methods: {
    test: function() {
      console.log(this.$refs.validCode.validCode);
      console.log("--------------");
      console.log(this.newValidCode);
      console.log();
    },
    go: function() {
      this.$store.commit('saveUserName', this.userName);
      this.$router.push({path: '/yun'});
    },
    goRegister: function() {
      this.$router.push({path: '/register'});
    },
    retrievePassword: function() {
      this.$store.commit('saveRegister', false);
      this.$router.push({path: '/reset'});
    },
    userLogin: function() {
      
      if(this.userName != '' && this.password != '') {
        
        if(this.validCode == '') {
          this.$message({
            message: '请输入验证码！',
            type: 'warning'
          });
        }else if(this.validCode.toLowerCase() != this.$refs.validCode.validCode.toLowerCase()) {
          this.$message({
            message: '验证码输入错误！',
            type: 'error'
          });
        }else{
          this.$axios.post('http://' + this.baseHost + '/userController/login', this.$qs.stringify({
              userName: this.userName,
              password: this.password
          })).then((response) => {
            if(response.data.message == "") {
              this.$message({
                message: '登录成功！即将进入袖珍网盘吧！',
                type: 'success'
              });
              
              this.$store.commit('saveUserName', response.data.userName);
              this.$store.commit('saveUserUUID', response.data.userUUID);
              this.$store.commit('saveModUserUUID', response.data.userUUID);
              
              if(this.$cookies.isKey("userUUID")) {
                this.$cookies.remove("userUUID");
                this.$cookies.set("userUUID", response.data.userUUID, 24 * 60 * 60);
              }else{
                // this.$cookies.set("userUUID", response.data.userUUID, 24 * 60 * 60);
                this.$cookies.set("userUUID", response.data.userUUID, 24 * 60 * 60);
              }
              
              clearTimeout(this.timer);  //清除延迟执行 
              this.timer = setTimeout(()=>{   //设置延迟执行
                  this.$router.push({path: '/yun'});
              },1500);
            }else{
              this.$message({
                message: '登录失败！' + response.data.message,
                type: 'error'
              });
            }
          }).catch(function (error) {
            console.log(error);
            this.$message({
              message: '登录失败！请检查网络！',
              type: 'error'
            });
          });
        }
      }else{
        if(this.userName == '' && this.password == '') {
          this.$message({
            message: '请输入账户和密码！',
            type: 'warning'
          });
        }else if(this.userName == '') {
          this.$message({
            message: '请输入邮箱地址或用户名！',
            type: 'warning'
          });
        }else if(this.password == '') {
          this.$message({
            message: '请输入密码！',
            type: 'warning'
          });
        }
      }
      
    },
    judgeUserCookies: function() {
      if(this.$cookies.isKey("userUUID")) {
        
          this.$axios.post('http://' + this.baseHost + '/userController/autoLogin', this.$qs.stringify({
              userUUID: this.$cookies.get("userUUID")
          })).then((response) => {
            if(response.data.message == "") {
              this.$message({
                message: '自动登录成功！即将进入袖珍网盘吧！',
                type: 'success'
              });
              
              this.$store.commit('saveUserName', response.data.userName);
              this.$store.commit('saveUserUUID', response.data.userUUID);
              this.$store.commit('saveModUserUUID', response.data.userUUID);
              
              clearTimeout(this.timer);  //清除延迟执行 
              this.timer = setTimeout(()=>{   //设置延迟执行
                  this.$router.push({path: '/yun'});
              },1500);
            }else{
              this.$message({
                message: '自动登录失败！' + response.data.message,
                type: 'error'
              });
            }
          }).catch(function (error) {
            console.log(error);
            this.$message({
              message: '自动登录失败！请检查网络！',
              type: 'error'
            });
          });
      }
    }
  }
}
</script>

<style scoped>
#login {
  background:url("../assets/nap.jpg") no-repeat top;
  /* background:url("../assets/20_21.jpg") no-repeat top; */
  background-size:cover;
  background-attachment: fixed;
  height: 100%;
  width: 100%;
  position: fixed;
  overflow:scroll;
  z-index: -1;
}
.login-container {
  border-radius: 15px;
  background-clip: padding-box;
  margin: 90px auto;
  width: 350px;
  padding: 35px 35px 15px 35px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px rgba(155,89,182,.5);
  position: relative;
  z-index: 3;
}
.login_title {
  margin: 0px auto 40px auto;
  text-align: center;
  color: #f3f9f1;
  user-select: none;
}
#particles-js{
  position: fixed;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 50%;
  z-index: 1;
}
.button-border {
  width: 100%;
  background: rgba(45, 45, 45, 0.33);
/*   border: none; */
  border: 1px solid #40E0D0;
/*   box-shadow: 0 0 25px rgba(155,89,182,.5); */
/*   box-shadow: 0 0 25px rgba(64,224,208,.5); */
}
.button-border:hover {
  width: 100%;
  background: rgba(45, 45, 45, 0.33);
/*   border: none; */
  border: 1px solid #40E0D0;
/*   box-shadow: 0 0 25px rgba(155,89,182,.5); */
  box-shadow: 0 0 25px rgba(64,224,208,.5);
}
.button-border-red {
  width: 100%;
  background: rgba(45, 45, 45, 0.33);
  border: 1px solid #E74C3C;  
}
.button-border-red:hover {
  width: 100%;
  background: rgba(45, 45, 45, 0.33);
  border: 1px solid #E74C3C;
  box-shadow: 0 0 25px rgba(236,112,99,.5);
}
::-webkit-scrollbar {
    display: none;
}
</style>