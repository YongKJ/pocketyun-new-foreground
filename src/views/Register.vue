<template>
  <el-row id="register">
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
    ></vue-particles>

    <el-form v-if="register" class="login-container" label-position="left" label-width="0px">
      <h3 class="login_title">新增用户</h3>
      
      <el-form-item style="user-select: none;"><el-input type="email" v-model="regEmail" placeholder="输入邮箱地址"></el-input></el-form-item>
      
      <!-- <el-form-item style="user-select: none;"><el-input type="text" v-model="userName" placeholder="您的用户名"></el-input></el-form-item> -->

      <el-form-item style="user-select: none;"><el-input type="password" v-model="password" placeholder="输入密码"></el-input></el-form-item>

      <el-form-item style="user-select: none;"><el-input type="password" v-model="matchPassword" placeholder="再次输入密码"></el-input></el-form-item>

      <!-- <el-form-item style="user-select: none;">
        <el-select v-model="regSex" placeholder="选择性别" style="width: 100%;">
          <el-option label="保密" value="保密"></el-option>
          <el-option label="男" value="男"></el-option>
          <el-option label="女" value="女"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item style="user-select: none;"><el-input type="number" v-model="regAge" placeholder="输入年龄"></el-input></el-form-item> -->

      <el-form-item style="user-select: none;">
        <el-input style="width: 58%" type="text" @keyup.enter.native="userRegister()" v-model="validCode" placeholder="输入邮箱验证码"></el-input>
        <div class="ValidCode disabled-select">
          <span v-show="show" @click="getCode()">{{ tips }}</span>
          <span v-show="!show" style="color: #618EBA;">{{ count }} s</span>
        </div>
      </el-form-item>

      <el-form-item style="width: 100%"><el-button type="primary" style="width: 100%;background: #4169E1;border: none" @click="userRegister()">注册</el-button></el-form-item>

      <el-form-item style="width: 100%"><el-button type="primary" class="button-border" @click="goLogin()">已经有账号？</el-button></el-form-item>
    </el-form>
    
    <el-form v-else class="login-container" label-position="left" label-width="0px">
      <h3 class="login_title">重置密码</h3>
      <el-form-item style="user-select: none;"><el-input type="email" v-model="regEmail" placeholder="输入邮箱地址"></el-input></el-form-item>
    
      <el-form-item style="user-select: none;"><el-input type="password" v-model="newPassword" placeholder="输入新密码"></el-input></el-form-item>
    
      <el-form-item style="user-select: none;"><el-input type="password" v-model="matchPassword" placeholder="再次输入密码"></el-input></el-form-item>
    
      <el-form-item style="user-select: none;">
        <el-input style="width: 58%" type="text" @keyup.enter.native="resetPassword()" v-model="validCode" placeholder="输入邮箱验证码"></el-input>
        <div class="ValidCode disabled-select">
          <span v-show="show" @click="getEmail()">{{ tips }}</span>
          <span v-show="!show" style="color: #618EBA;">{{ count }} s</span>
        </div>
      </el-form-item>
    
      <el-form-item style="width: 100%"><el-button type="primary" style="width: 100%;background: #4169E1;border: none" @click="resetPassword()">重置</el-button></el-form-item>
    
      <el-form-item style="width: 100%"><el-button type="primary" class="button-border" @click="goLogin()">返回登录页面</el-button></el-form-item>
    </el-form>
  </el-row>
</template>

<script>
export default {
  name: 'register',
  data() {
    return {
      baseHost: '',
      userName: '',
      password: '',
      newPassword: '',
      matchPassword: '',
      regSex: '',
      regAge: '',
      regEmail: '',
      validCode: '',
      verificationCode: '',
      tips: '获取验证码',
      show: true,
      count: '',
      timer: null,
      register: true,
      cmText: 'nothing'
    };
  },
  mounted() {
    this.baseHost = this.$store.state.baseHost;
    this.register = this.$store.state.register;
    // console.log(this.register);
  },
  methods: {
    btnClick: function() {
      console.log(this.cmText);
      this.$axios
        .post(
          'http://' + this.baseHost + '/postbar/myCommentController/getCommentByCmUUID',
          this.$qs.stringify({
            cmUUID: '4b650f87f19346ceb52969153c286719'
          })
        )
        .then(response => {
          this.cmText = response.data.cmText;
          console.log(response);
          console.log(response.data.cmText);
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    goLogin: function() {
      if(!this.register) {
        this.$store.commit('saveRegister', true);
      }
      this.$router.push({ path: '/login' });
    },
    userRegister: function() {
      if (this.password != '' && this.matchPassword != '' && this.regEmail != '') {
        var email = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        
        if(this.password.length < 6) {
          this.$message.warning('温馨提示：密码最小长度6个字符！');
        } else if (this.password != this.matchPassword) {
          this.$message({
            message: '两次输入密码不一致！',
            type: 'error'
          });
        } else if (!email.test(this.regEmail)) {
          this.$message({
            message: '请输入正确的email地址',
            type: 'error'
          });
        } else {
          
          if(!this.show) {
            if(this.validCode != '') {
              
              if(this.$md5(this.validCode) == this.verificationCode) {
                this.$axios
                  .post(
                    'http://' + this.baseHost + '/userController/register',
                    this.$qs.stringify({
                      password: this.password,
                      regEmail: this.regEmail
                    })
                  )
                  .then(response => {
                    if (response.data.message == '') {
                      this.$message({
                        message: '注册成功！即将跳转到登录页面！',
                        type: 'success'
                      });
                
                      clearTimeout(this.timer); //清除延迟执行
                      this.timer = setTimeout(() => {
                        //设置延迟执行
                        this.$router.push({ path: '/login' });
                      }, 1500);
                    }
                  })
                  .catch(function(error) {
                    console.log(error);
                  });
              }else{
                this.$message({
                  message: '验证码错误！请输入正确的验证码！',
                  type: 'error'
                });
              }
              
            }else{
              this.$message({
                message: '请输入邮箱验证码！',
                type: 'warning'
              });
            }
          }else{
            if(this.tips == "获取验证码") {
              this.$message({
                message: '您还未获取邮箱验证码！',
                type: 'warning'
              });
            }else{
              this.$message({
                message: '邮箱验证码已过期！',
                type: 'error'
              });
            }
          }
          
        }
      } else {
        this.$message.warning('请输入注册信息！');
      }
    },
    resetPassword: function() {
      if(this.regEmail != '') {
        if(this.newPassword != '') {
          if(this.newPassword.length >= 6) {
            if(this.matchPassword != '') {
              if(this.newPassword == this.matchPassword) {
                
                if(!this.show) {
                  if(this.validCode != '') {
                    if(this.$md5(this.validCode) == this.verificationCode) {
                      this.$axios.post('http://' + this.baseHost + '/userController/resetPassword', this.$qs.stringify({
                          regEmail: this.regEmail,
                          newPassword: this.newPassword
                      })).then((response) => {
                        // console.log(response.data);
                        
                        if(response.data.message == '') {
                          this.$message({
                            message: '重置成功！即将跳转到登录页面！',
                            type: 'success'
                          });
                                          
                          clearTimeout(this.timer); //清除延迟执行
                          this.timer = setTimeout(() => {
                            //设置延迟执行
                            if(!this.register) {
                              this.$store.commit('saveRegister', true);
                            }
                            this.$router.push({ path: '/login' });
                          }, 1500);
                        }else{
                          this.$message({
                            message: '重置失败！' + response.data.message,
                            type: 'error'
                          });
                        }
                      }).catch(function (error) {
                        console.log(error);
                        this.$message({
                          message: '验证邮箱地址失败！服务器内部错误！',
                          type: 'error'
                        });
                      });
                    }else{
                      this.$message({
                        message: '验证码错误！请输入正确的验证码！',
                        type: 'error'
                      });
                    }
                    
                  }else{
                    this.$message({
                      message: '请输入邮箱验证码！',
                      type: 'warning'
                    });
                  }
                }else{
                  if(this.tips == "获取验证码") {
                    this.$message({
                      message: '您还未获取邮箱验证码！',
                      type: 'warning'
                    });
                  }else{
                    this.$message({
                      message: '邮箱验证码已过期！',
                      type: 'error'
                    });
                  }
                }
                
              }else{
                this.$message({
                  message: '两次输入密码不一致！',
                  type: 'error'
                });
              }
            }else{
              this.$message.warning('请输入确认密码！');
            }
          }else{
            this.$message.warning('温馨提示：密码最小长度为6个字符！');
          }
        }else{
          this.$message.warning('请输入新的密码！');
        }
      }else{
        this.$message.warning('请输入邮箱地址！');
      }
    },
    getCode: function() {
      if(this.regEmail != '') {
        
        var email = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        
        if (!email.test(this.regEmail)) {
          this.$message({
            message: '请输入正确的email地址',
            type: 'error'
          });
        } else {
          
          this.$message({
            message: '验证码正在发送中，请耐心等待！',
            type: 'info'
          });
          
          const TIME_COUNT = 90;
          if (!this.timer) {
            this.count = TIME_COUNT;
            this.show = false;
            this.timer = setInterval(() => {
              if (this.count > 0 && this.count <= TIME_COUNT) {
                this.count--;
              } else {
                this.tips = '重新获取';
                this.show = true;
                clearInterval(this.timer);
                this.timer = null;
              }
            }, 1000);
          }
          
          this.$axios.post('http://' + this.baseHost + '/userController/getEmailValidCode', this.$qs.stringify({
              email: this.regEmail
          })).then((response) => {
            // console.log(response.data);
            
            if(response.data.message == '') {
              this.verificationCode = response.data.validCode;
              
              this.$message({
                message: '验证码已经发送！请检查收件箱！',
                type: 'success'
              });
              
            }else{
              this.$message({
                message: '验证码发送失败！' + response.data.message,
                type: 'warning'
              });
              
              this.show = true;
              clearInterval(this.timer);
              this.timer = null;
            }
          }).catch(function (error) {
            console.log(error);
            this.$message({
              message: '邮箱验证码发送失败！服务器内部错误！',
              type: 'error'
            });
          });
          
        }
      }else{
        this.$message({
          message: '请输入邮箱地址！',
          type: 'warning'
        });
      }
    },
    getEmail: function() {
      
      if(this.regEmail != '') {
        
        this.$message({
          message: '验证码正在发送中，请耐心等待！',
          type: 'info'
        });
        
        const TIME_COUNT = 90;
        if (!this.timer) {
          this.count = TIME_COUNT;
          this.show = false;
          this.timer = setInterval(() => {
            if (this.count > 0 && this.count <= TIME_COUNT) {
              this.count--;
            } else {
              this.tips = '重新获取';
              this.show = true;
              clearInterval(this.timer);
              this.timer = null;
            }
          }, 1000);
        }
        
        this.$axios.post('http://' + this.baseHost + '/userController/getResetPasswordEmailValidCode', this.$qs.stringify({
            regEmail: this.regEmail
        })).then((response) => {
          // console.log(response.data);
          
          if(response.data.message == '') {
            this.verificationCode = response.data.validCode;
            
            this.$message({
              message: '验证码已经发送！请检查收件箱！',
              type: 'success'
            });
            
          }else{
            this.$message({
              message: '验证码发送失败！' + response.data.message,
              type: 'warning'
            });
            
            this.show = true;
            clearInterval(this.timer);
            this.timer = null;
          }
        }).catch(function (error) {
          console.log(error);
          this.$message({
            message: '邮箱验证码发送失败！服务器内部错误！',
            type: 'error'
          });
        });
      }else{
        this.$message.warning('请输入邮箱地址！');
      }
      
    }
  }
};
</script>

<style scoped>
#register {
  background: url('../assets/866089.png') no-repeat top;
  background-size: cover;
  background-attachment: fixed;
  height: 100%;
  width: 100%;
  position: fixed;
  overflow: scroll;
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
  box-shadow: 0 0 25px rgba(155, 89, 182, 0.5);
  position: relative;
  z-index: 3;
}
.login_title {
  margin: 0px auto 40px auto;
  text-align: center;
  color: #f3f9f1;
  user-select: none;
}
#particles-js {
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
  border: 1px solid #40e0d0;
  /*   box-shadow: 0 0 25px rgba(155,89,182,.5); */
  /*   box-shadow: 0 0 25px rgba(64,224,208,.5); */
}
.button-border:hover {
  width: 100%;
  background: rgba(45, 45, 45, 0.33);
  /*   border: none; */
  border: 1px solid #40e0d0;
  /*   box-shadow: 0 0 25px rgba(155,89,182,.5); */
  box-shadow: 0 0 25px rgba(64, 224, 208, 0.5);
}
.ValidCode {
  width: 100px;
  height: 40px;
  float: right;
  color: #666666;
  background-color: #f8f9fa;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  span {
    display: inline-block;
  }
}
::-webkit-scrollbar {
    display: none;
}
</style>
