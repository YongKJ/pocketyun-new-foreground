<template>

    <div id="email">
      
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
      
      <el-container class="user-container" :style="flag?'width: 90%;padding: 35px 35px 15px 35px;':'width:350px;padding: 20px 14px 20px 14px;'">
        <el-header class="user-title">
          管理邮件
        </el-header>
        <el-main style="padding-left: 0px;padding-right: 0px;">
          
          <el-table
          class="user-table"
          :header-cell-style="{color: '#000000'}"
          :default-sort = "{prop: 'sendUserName', order: 'ascending'}"
          :data="emails">
            
            <el-table-column
              sortable
              show-overflow-tooltip
              header-align="center"
              align="center" 
              prop="sendUserName"
              label="发件人"
              :width="flag ? '100' : '90'">
            </el-table-column>
            
            <el-table-column
              sortable
              header-align="center"
              align="center" 
              prop="sendTime"
              label="发送时间"
              v-if="flag">
            </el-table-column>
            
            <el-table-column
              sortable
              header-align="center"
              align="center" 
              prop="receiveUserName"
              label="收件人"
              :width="flag ? '100' : '90'">
            </el-table-column>
            
            <el-table-column
              sortable
              show-overflow-tooltip
              header-align="center"
              align="center" 
              prop="emailTitle"
              label="邮件主题"
              :width="flag ? '' : '120'">
            </el-table-column>
            
            <el-table-column
              sortable
              show-overflow-tooltip
              header-align="center"
              align="center" 
              prop="emailContent"
              label="邮件内容"
              :width="flag ? '' : '120'">
            </el-table-column>

            <el-table-column
              header-align="center"
              align="center" 
              label="操作"
              :width="flag ? '200' : '75'">
              
              <template slot-scope="scope">
                <el-container>
                  <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                    <el-link type="primary"  @click="deleteEmail(scope.row.emailUUID)"> <i class="el-icon-circle-close"></i> 删除 </el-link>
                  </el-main>
                </el-container>
              </template>
              
            </el-table-column>
            
          </el-table>
          
        </el-main>
        <el-footer>
          <el-form class="login-container" label-position="left" label-width="0px">
            <el-form-item style="width: 100%">
              <el-button type="primary" class="button-border" @click="goYun()">返回</el-button>
            </el-form-item>
          </el-form>
        </el-footer>
      </el-container>
      
    </div>

</template>

<script>
  
export default {
  name: 'email',
  data() {
    return {
      flag: true,
      baseHost: '',
      emails: []
    }
  },
  mounted() {
    this.baseHost = this.$store.state.baseHost;
    
    if(this.$store.state.userName == '') {
      this.$message({
        message: '用户未登录！即将返回登录页面',
        type: 'error'
      });
      
      clearTimeout(this.timer);  //清除延迟执行 
      this.timer = setTimeout(()=>{   //设置延迟执行
          this.$router.push({path: '/login'});
      },1500);
    }else if(this.$store.state.userName == 'admin') {
      this.getEmailsInfo();
      
      if(this.isMobile()) {
        this.flag = false;
      }
    }else{
      this.$message({
        message: '不是管理员账号，无法删除用户！即将返回袖珍网盘吧',
        type: 'error'
      });
      
      clearTimeout(this.timer);  //清除延迟执行 
      this.timer = setTimeout(()=>{   //设置延迟执行
          this.$router.push({path: '/yun'});
      },1500);
    }
  },
  methods: {
    isMobile: function() {
       let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
       return flag;
    },
    goYun: function() {
      this.$router.push({path: '/yun'});
    },
    getEmailsInfo: function() {
      this.$axios.post('http://' + this.baseHost + '/userController/getEmailDtosList', this.$qs.stringify({
              
            })).then((response) => {
              this.emails = response.data.emailDtosList;
              // console.log(response.data);
            }).catch(function (error) {
              console.log(error);
            });
    },
    deleteEmail: function(emailUUID) {
      this.$confirm('提示：确定删除此邮件信息？', '删除邮件', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        
        this.$axios.post('http://' + this.baseHost + '/userController/delEmailDto', this.$qs.stringify({
          emailUUID: emailUUID
        })).then((response) => {
          if(response.data.message == "") {
            this.$message({
              message: '删除邮件成功！',
              type: 'success'
            });
            
            this.emails = response.data.emailDtosList;
          }
        }).catch(function (error) {
          console.log(error);
        });
        
      }).catch(() => {
        this.test = 2;
      });
    }
  }
}
</script>

<style scoped>
  @import '../assets/css/style.css';
  
  #email {
    background:url("../assets/silence.jpg") no-repeat top;
    background-size:cover;
    background-attachment: fixed;
    height: 100%;
    width: 100%;
    position: fixed;
    overflow:scroll;
    z-index: -1;
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
  .user-container {
    border-radius: 15px;
    background-clip: padding-box;
    margin: 5% auto;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px rgba(155,89,182,.5);
    color: white;
    text-align: center;
    position: relative;
    z-index: 3;
  }
  .user-title {
    font-size: 1.75rem;
    color: #f3f9f1;
    border-bottom: 1px solid #EBEEF5;
    user-select: none;
  }
  .user-row {
    border-bottom: 1px solid #EBEEF5;
  }
  .user-table {
    color: black;
    width: 100%;
    border-radius: 4px;
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
  .login-container {
    margin: 0 auto;
    width: 50%;
    position: relative;
    z-index: 3;
  }
  ::-webkit-scrollbar {
      display: none;
  }
</style>