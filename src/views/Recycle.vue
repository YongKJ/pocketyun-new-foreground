<template>

    <div id="delete">
      
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
          文件回收站
        </el-header>
        <el-main style="padding-left: 0px;padding-right: 0px;">
          
          <el-table
            class="user-table"
            :header-cell-style="{color: '#000000'}"
            :data="files.slice((currentPage - 1) * pagesize, currentPage * pagesize)"
            @selection-change="handleSelectionChange"
            @sort-change="sortchange"
          >
          
            <el-table-column sortable="custom" show-overflow-tooltip prop="filename" label="文件名" :width="flag ? '250' : '105'">
              <template slot-scope="scope">
                <span v-if="judgeFileType(scope.row.filename) === 1" class="folder">
                  {{ scope.row.filename.replace('/', '') }}
                </span>
                <span v-else>{{ scope.row.filename.replace('/', '') }}</span>
              </template>
            </el-table-column>
            
            <el-table-column show-overflow-tooltip header-align="center" align="center" sortable="custom" v-if="flag" prop="addTime" label="创建日期"></el-table-column>
            
            <el-table-column show-overflow-tooltip header-align="center" align="center" sortable="custom" prop="size" label="大小" :width="flag ? '' : '75'"></el-table-column>
            
            <el-table-column show-overflow-tooltip header-align="center" align="center" sortable="custom" v-if="flag" prop="deleteTime" label="删除" :width="flag ? '' : '75'"></el-table-column>
            
            <el-table-column header-align="center" align="center" label="操作" :width="flag ? '200' : '90'">
              <template slot-scope="scope">
                <el-container v-if="judgeFileType(scope.row.filename) === 1">
                  <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                    <el-link type="primary" :style="flag ? 'margin-right:10px;' : ''" @click="restoreFile(scope.row.filename, scope.row.pathsUUID)">
                      <i class="el-icon-edit"></i>
                      还原
                    </el-link>
                    <el-link type="primary" @click="deleteFile(scope.row.filename, scope.row.pathsUUID)">
                      <i class="el-icon-folder-delete"></i>
                      删除
                    </el-link>
                  </el-main>
                </el-container>
                <el-container v-else>
                  <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                    <el-link type="primary" :style="flag ? 'margin-right:10px;' : ''" @click="restoreFile(scope.row.filename, scope.row.pathsUUID)">
                      <i class="el-icon-edit"></i>
                      还原
                    </el-link>
                    <el-link type="primary" @click="deleteFile(scope.row.filename, scope.row.pathsUUID)">
                      <i class="el-icon-document-delete"></i>
                      删除
                    </el-link>
                  </el-main>
                </el-container>
              </template>
            </el-table-column>
            
            <el-table-column align="center" type="selection" :width="flag ? '55' : ''"></el-table-column>
            
          </el-table>
          
         <el-col v-if="!flag" :span="24" class="page">
           <el-pagination
             @size-change="handleSizeChange"
             @current-change="handleCurrentChange"
             :current-page="currentPage"
             :page-size="pagesize"
             class="pagination1"
             layout="prev, pager, next"
             :pager-count="5"
             :total="files.length"
           ></el-pagination>
         </el-col>
         <el-col v-else :span="24" class="page">
           <el-pagination
             @size-change="handleSizeChange"
             @current-change="handleCurrentChange"
             :current-page="currentPage"
             :page-sizes="[10, 15, 20, 25, 30]"
             :page-size="pagesize"
             class="pagination2"
             layout="total, sizes, prev, pager, next, jumper"
             :pager-count="11"
             :total="files.length"
           ></el-pagination>
         </el-col> 
          
        </el-main>
        <el-footer height="100%">
          <el-form class="login-container" label-position="left" label-width="0px">
            <el-row :gutter="10">
              <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <el-form-item style="width: 100%">
                  <el-button type="primary" class="button-border" @click="restoreFiles()">还原选中</el-button>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <el-form-item style="width: 100%">
                  <el-button type="primary" class="button-border" @click="deleteFiles()">删除选中</el-button>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <el-form-item style="width: 100%">
                  <el-button type="primary" class="button-border" @click="goYun()">返回</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-footer>
      </el-container>
      
    </div>

</template>

<script>
  
export default {
  name: 'delete',
  data() {
    return {
      flag: true,
      baseHost: '',
      users:[],
      files:[],
      currentPage: 1, //初始页
      pagesize: 10, //    每页的数据
      filesSelection: [],
      saveFiles: []
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
    }else{
      this.getRecycleFilesInfo();
      
      if(this.isMobile()) {
        this.flag = false;
      }
    }
  },
  methods: {
    isMobile: function() {
       let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
       return flag;
    },
    go: function() {
      this.$store.commit('saveUserName', this.userName);
      this.$router.push({path: '/yun'});
    },
    userClass: function({row, columnIndex}) {
      if(columnIndex === 1 && row.operate === '删除') {
        return 'blue-cell';
      }
    },
    goYun: function() {
      this.$router.push({path: '/yun'});
    },
    getUsersInfo: function() {
      this.$axios.post('http://' + this.baseHost + '/userController/getUsers', this.$qs.stringify({
        
      })).then((response) => {
//         console.log(response.data.userSpace);
        this.users = response.data.usersList;
//         console.log(this.users);
        for(let i = 0; i < this.users.length; i++) {
          this.users[i]['userSpace']= response.data.userSpace[i];
          if(this.users[i].loginTime == '') {
            this.users[i].loginTime = '--';
          }
          var userTotalSize = this.userSpaceSize = this.users[i].userName == 'admin' ? this.$store.state.adminSpaceSize : this.$store.state.userSpaceSize;
          var space = this.users[i].userSpace;
          var userSpace = '';
          if(space <= 1024) {
            userSpace = '空间大小：' + parseFloat(space).toFixed(2) + 'MB / ' + (userTotalSize / (1024 * 1024 * 1024)) + 'GB';
          }else{
            userSpace = '空间大小：' + parseFloat(space / 1024).toFixed(2) + 'GB / ' + (userTotalSize / (1024 * 1024 * 1024)) + 'GB';
          }
          this.users[i].userSpace = userSpace;
          this.users[i]['progress'] = space / (userTotalSize / (1024 * 1024)) * 100;
        }
//         console.log(this.users);
      }).catch(function (error) {
        console.log(error);
      });
    },
    deleteUser:function(name) {
      
      this.$confirm('提示：确定删除用户 [' + name + ']？', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        
        this.$axios.post('http://' + this.baseHost + '/userController/delUser', this.$qs.stringify({
          userName: name
        })).then((response) => {
          if(response.data.message == "") {
            this.$message({
              message: '删除用户成功！',
              type: 'success'
            });
            
            this.users = response.data.usersList;
          }
        }).catch(function (error) {
          console.log(error);
        });
        
      }).catch(() => {
        this.test = 2;
      });
    },
    modUser: function(name, userUUID) {
      this.$confirm('提示：确定修改用户 [' + name + ']？', '修改用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        
//         console.log(userUUID);
        this.$store.commit('saveModUserUUID', userUUID);
        this.$router.push({path: '/operate'});
        
      }).catch(() => {
        this.test = 2;
      });
    },
    handleSelectionChange: function(val) {
      this.filesSelection = val;
    },
    sortchange: function(column) {
      if (column.prop == 'size') {
        if(column.order == 'ascending') {
          this.files.sort(this.sortByFileSizeASC);
        }else if(column.order == 'descending') {
          this.files.sort(this.sortByFileSizeDESC);
        }else{
          this.$axios
            .post(
              'http://' + this.baseHost + '/pathsController/getFiles',
              this.$qs.stringify({
                userUUID: this.$store.state.userUUID,
                path: this.nowFolder.path,
                depth: this.nowFolder.depth + 1
              })
            )
            .then(response => {
              this.saveFiles = response.data.pathsDtosList;
              this.files = this.saveFiles;
              // this.currentPage = 1;
              // this.pagesize = 10;
              // this.totalSizes = response.data.totalSizes;
            })
            .catch(error => {
              console.log(error);
              this.$message({
                type: 'error',
                message: '获取文件列表失败！服务器内部错误！'
              });
            });
        }
      }else if(column.prop == 'filename') {
        if(column.order == 'ascending') {
          this.files.sort(this.sortByFileNameASC);
        }else if(column.order == 'descending') {
          this.files.sort(this.sortByFileNameDESC);
        }else{
          this.$axios
            .post(
              'http://' + this.baseHost + '/pathsController/getFiles',
              this.$qs.stringify({
                userUUID: this.$store.state.userUUID,
                path: this.nowFolder.path,
                depth: this.nowFolder.depth + 1
              })
            )
            .then(response => {
              this.saveFiles = response.data.pathsDtosList;
              this.files = this.saveFiles;
              // this.currentPage = 1;
              // this.pagesize = 10;
              // this.totalSizes = response.data.totalSizes;
            })
            .catch(error => {
              console.log(error);
              this.$message({
                type: 'error',
                message: '获取文件列表失败！服务器内部错误！'
              });
            });
        }
      }else if(column.prop == 'addTime') {
        if(column.order == 'ascending') {
          this.files.sort(this.sortByFileDateASC);
        }else if(column.order == 'descending') {
          this.files.sort(this.sortByFileDateDESC);
        }else{
          this.$axios
            .post(
              'http://' + this.baseHost + '/pathsController/getFiles',
              this.$qs.stringify({
                userUUID: this.$store.state.userUUID,
                path: this.nowFolder.path,
                depth: this.nowFolder.depth + 1
              })
            )
            .then(response => {
              this.saveFiles = response.data.pathsDtosList;
              this.files = this.saveFiles;
              // this.currentPage = 1;
              // this.pagesize = 10;
              // this.totalSizes = response.data.totalSizes;
            })
            .catch(error => {
              console.log(error);
              this.$message({
                type: 'error',
                message: '获取文件列表失败！服务器内部错误！'
              });
            });
        }
      }
    },
    sortByFileDateASC: function(obj1, obj2) {
      var date1 = new Date(obj1.addTime);
      var date2 = new Date(obj2.addTime);
      
      var s1 = parseFloat(date1.getTime() / 1000);
      var s2 = parseFloat(date2.getTime() / 1000);
      
      return s1 - s2;
    },
    sortByFileDateDESC: function(obj1, obj2) {
      var date1 = new Date(obj1.addTime);
      var date2 = new Date(obj2.addTime);
      
      var s1 = parseFloat(date1.getTime() / 1000);
      var s2 = parseFloat(date2.getTime() / 1000);
      
      return s2 - s1;
    },
    sortByFileSizeASC: function(obj1, obj2) {
      var size1 = 0;
      if(obj1.size != "--") {
        size1 = parseFloat(obj1.size.slice(0, obj1.size.length - 2));
      }
      var size2 = 0;
      if(obj2.size != "--") {
        size2 = parseFloat(obj2.size.slice(0, obj2.size.length - 2));
      }
      
      return size1 - size2;
    },
    sortByFileSizeDESC: function(obj1, obj2) {
      var size1 = 0;
      if(obj1.size != "--") {
        size1 = parseFloat(obj1.size.slice(0, obj1.size.length - 2));
      }
      var size2 = 0;
      if(obj2.size != "--") {
        size2 = parseFloat(obj2.size.slice(0, obj2.size.length - 2));
      }
      
      return size2 - size1;
    },
    sortByFileNameASC: function(obj1, obj2) {
      return obj1.filename.localeCompare(obj2.filename, 'zh-CN');
    },
    sortByFileNameDESC: function(obj1, obj2) {
      return obj2.filename.localeCompare(obj1.filename, 'zh-CN');
    },
    judgeFileType: function(filename) {
      if (filename.indexOf('/') != -1) {
        return 1;
      } else if (filename.toLowerCase().indexOf('.mp3') != -1) {
        return 2;
      } else if (
        filename
          .toLowerCase()
          .toLowerCase()
          .indexOf('.wav') != -1
      ) {
        return 2;
      } else if (filename.toLowerCase().indexOf('.flac') != -1) {
        return 2;
      } else if (filename.toLowerCase().indexOf('.mp4') != -1) {
        return 3;
      } else if (filename.toLowerCase().indexOf('.webm') != -1) {
        return 3;
      } else if (filename.toLowerCase().indexOf('.mkv') != -1) {
        return 3;
      } else if (filename.toLowerCase().indexOf('.jpg') != -1) {
        return 4;
      } else if (filename.toLowerCase().indexOf('.png') != -1) {
        return 4;
      } else if (filename.toLowerCase().indexOf('.jpeg') != -1) {
        return 4;
      }

      var text = [
        '.adoc',
        '.asm',
        '.bin',
        '.conf',
        '.cpp',
        '.css',
        '.c',
        '.groovy',
        '.go',
        '.html',
        '.java',
        '.json',
        '.jsp',
        '.js',
        '.lua',
        '.makefile',
        '.md',
        '.txt',
        '.properties',
        '.perl',
        '.php',
        '.ps1',
        '.pyc',
        '.py',
        '.rb',
        '.sh',
        '.svg',
        '.sql',
        '.ts',
        '.xml',
        '.vb',
        '.yaml'
      ];

      for (let i = 0; i < text.length; i++) {
        if (filename.toLowerCase().indexOf(text[i]) != -1) {
          return 5;
        }
      }

      return 6;
    },
    // 初始页currentPage、初始每页数据数pagesize和数据data
    handleSizeChange: function(size) {
      this.pagesize = size;
      // console.log(this.pagesize)  //每页下拉显示数据
    },
    handleCurrentChange: function(currentPage) {
      this.currentPage = currentPage;
      // console.log(this.currentPage)  //点击第几页
    },
    getRecycleFilesInfo: function() {
      this.$axios.post('http://' + this.baseHost + '/pathsController/getRecycleFiles', this.$qs.stringify({
        userUUID: this.$store.state.userUUID
      })).then((response) => {
        
        this.files = response.data.pathsDtosList;
        this.currentPage = 1;
        this.pagesize = 10;
        
      }).catch(function (error) {
        console.log(error);
      });
    },
    deleteFile: function(filename, pathsUUID) {
      
        var tips = filename.indexOf('/') == -1 ? '文件' : '文件夹';
        this.$confirm('此操作将永久删除' + tips + ' [' + filename.replace('/', '') + '], 是否继续?', '删除' + tips, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.$axios
              .post(
                'http://' + this.baseHost + '/pathsController/delRecycleFile',
                this.$qs.stringify({
                  userUUID: this.$store.state.userUUID,
                  pathsUUID: pathsUUID
                })
              )
              .then(response => {
                  this.files = response.data.pathsDtosList;
                  this.currentPage = 1;
                  this.pagesize = 10;
                  
                  this.$message({
                    type: 'success',
                    message: '删除成功!'
                  });
              })
              .catch(error => {
                console.log(error);
                this.$message({
                  type: 'error',
                  message: tips + '删除失败！服务器内部错误！'
                });
              });
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
    },
    restoreFile: function(filename, pathsUUID) {
      
        var tips = filename.indexOf('/') == -1 ? '文件' : '文件夹';
        this.$confirm('此操作将还原' + tips + ' [' + filename.replace('/', '') + '], 是否继续?', '还原' + tips, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.$axios
              .post(
                'http://' + this.baseHost + '/pathsController/restoreRecycleFile',
                this.$qs.stringify({
                  userUUID: this.$store.state.userUUID,
                  pathsUUID: pathsUUID
                })
              )
              .then(response => {
                  this.files = response.data.pathsDtosList;
                  this.currentPage = 1;
                  this.pagesize = 10;
                  
                  this.$message({
                    type: 'success',
                    message: '还原成功!'
                  });
              })
              .catch(error => {
                console.log(error);
                this.$message({
                  type: 'error',
                  message: tips + '还原失败！服务器内部错误！'
                });
              });
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消还原'
            });
          });
    },
    deleteFiles: function() {

      if (this.filesSelection.length != 0) {
        this.$confirm('提示：确定要彻底删除这' + this.filesSelection.length + '项文件吗？该操作不可恢复！', '删除文件', {
          confirmButtonText: '全部删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.$axios
              .post(
                'http://' + this.baseHost + '/pathsController/delRecycleFiles',
                this.$qs.stringify({
                  userUUID: this.$store.state.userUUID,
                  filesJsonArray: JSON.stringify(this.filesSelection)
                })
              )
              .then(response => {
                  this.files = response.data.pathsDtosList;
                  this.currentPage = 1;
                  this.pagesize = 10;
                  this.filesSelection = [];
              })
              .catch(error => {
                console.log(error);
                this.$message({
                  type: 'error',
                  message: '文件删除失败！服务器内部错误！'
                });
              });

            this.$message({
              type: 'success',
              message: '文件删除成功!'
            });
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
      } else {
        this.$confirm('提示：您还未选择任何文件，请先选中一些文件后再执行本操作！', '删除文件', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.test = 1;
          })
          .catch(() => {
            this.test = 2;
          });
      }
    },
    restoreFiles: function() {

      if (this.filesSelection.length != 0) {
        this.$confirm('提示：确定要还原这' + this.filesSelection.length + '项文件吗？', '还原文件', {
          confirmButtonText: '全部还原',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.$axios
              .post(
                'http://' + this.baseHost + '/pathsController/restoreRecycleFiles',
                this.$qs.stringify({
                  userUUID: this.$store.state.userUUID,
                  filesJsonArray: JSON.stringify(this.filesSelection)
                })
              )
              .then(response => {
                  this.files = response.data.pathsDtosList;
                  this.currentPage = 1;
                  this.pagesize = 10;
                  this.filesSelection = [];
              })
              .catch(error => {
                console.log(error);
                this.$message({
                  type: 'error',
                  message: '文件删除失败！服务器内部错误！'
                });
              });

            this.$message({
              type: 'success',
              message: '文件删除成功!'
            });
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
      } else {
        this.$confirm('提示：您还未选择任何文件，请先选中一些文件后再执行本操作！', '还原文件', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.test = 1;
          })
          .catch(() => {
            this.test = 2;
          });
      }
    }
  }
}
</script>

<style scoped>
  @import '../assets/css/style.css';
  
  #delete {
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
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
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
  .folder {
    color: #409eff;
  }
  .folder:hover {
    color: #409eff;
    border-bottom: 1px solid #409eff;
  }
  .page {
    width: 100%;
    height: 53px;
    margin: 0 auto;
    background-color: white;
    text-align: left;
    /* border-radius: 4px; */
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  .pagination1 {
    padding-left: 3px;
    position: relative;
    top: 11px;
  }
  .pagination2 {
    padding-left: 10px;
    position: relative;
    top: 11px;
  }
  ::-webkit-scrollbar {
      display: none;
  }
</style>