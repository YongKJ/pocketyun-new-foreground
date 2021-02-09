<template>
  <div id="yun">
    <vue-particles
      color="#ffffff"
      :particleOpacity="0.7"
      :particlesNumber="100"
      shapeType="circle"
      :particleSize="3"
      linesColor="#E6E6FA"
      :linesWidth="1"
      :lineLinked="false"
      :lineOpacity="0.6"
      :linesDistance="150"
      :moveSpeed="8"
      :hoverEffect="true"
      hoverMode="grab"
      :clickEffect="true"
      clickMode="repulse"
    ></vue-particles>

    <el-row class="head" :style="flag ? 'width:80%;' : 'width:326px;'">
      <el-col :span="14">
        <el-container><el-main class="head-logo">袖珍网盘吧</el-main></el-container>
      </el-col>
      <el-col :span="10">
        <el-container>
          <el-main class="head-col">
            <el-dropdown trigger="click">
              <span class="el-dropdown-link">
                {{ userName }}
                <i class="el-icon-caret-bottom el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item style="font-size:12px;height:36px;text-align:center;">
                  <el-tooltip
                    :content="
                      '空间大小：' +
                        (totalSizes <= 1024 ? totalSizes.toFixed(2) + 'MB' : (totalSizes / 1024).toFixed(2) + 'GB') +
                        ' / ' +
                        userSpaceSize / (1024 * 1024 * 1024) +
                        'GB'
                    "
                    placement="left"
                    effect="light"
                  >
                    <el-progress
                      :text-inside="true"
                      :stroke-width="15"
                      :percentage="Math.round((totalSizes / (userSpaceSize / (1024 * 1024))) * 100)"
                      style="line-height: 33px;"
                    ></el-progress>
                  </el-tooltip>
                </el-dropdown-item>
                <el-dropdown-item icon="el-icon-setting" @click.native="goSetting()">修改信息</el-dropdown-item>
                <el-dropdown-item icon="el-icon-s-operation" @click.native="goChange()">修改密码</el-dropdown-item>
                <el-dropdown-item icon="el-icon-takeaway-box" @click.native="goRecycle()">回收文件</el-dropdown-item>
                <el-dropdown-item icon="el-icon-chat-line-round" v-if="userName === 'admin'" @click.native="getEmailsInfo()">发送邮件</el-dropdown-item>
                <el-dropdown-item icon="el-icon-chat-line-square" v-else @click.native="openFeedback()">反馈信息</el-dropdown-item>
                <el-dropdown-item icon="el-icon-message" v-if="userName === 'admin'" @click.native="goEmail()">管理邮件</el-dropdown-item>
                <el-dropdown-item icon="el-icon-user" v-if="userName === 'admin'" @click.native="goDelete()">管理用户</el-dropdown-item>
                <el-dropdown-item icon="el-icon-warning-outline" @click.native="loginOut()">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-main>
        </el-container>
      </el-col>
    </el-row>

    <el-row class="body" :style="flag ? 'width:80%;' : 'width:326px;'">
      <el-row class="menu">
        <el-col :span="1" v-show="flag">
          <span class="el-dropdown-link" style="color:#6C757D;" v-if="nowFolder.filename === '/'"><i class="el-icon-back el-icon--left"></i></span>
          <span class="el-dropdown-link" v-else>
            <i class="el-icon-back el-icon--left" @click="goBack(folders[folders.length - 1].path, folders[folders.length - 1].depth + 1)"></i>
          </span>
        </el-col>

        <el-col :span="5" v-show="flag" style="overflow:hidden;">
          <span class="el-dropdown-link" style="font-size:14px;cursor:text;">
            <i class="el-icon-folder el-icon--left"></i>
            {{ nowFolder.filename === '/' ? nowFolder.filename : nowFolder.filename.replace('/', '') }}
          </span>
        </el-col>

        <el-col :span="width">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              上一级
              <i class="el-icon-caret-bottom el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-folder-opened" v-for="folder in folders" :key="folder.id" @click.native="getFolderFiles(folder.path, folder.depth + 1)">
                {{ folder.filename == '/' ? folder.filename : folder.filename.replace('/', '') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>

        <el-col :span="9" v-show="flag">
          <el-form style="user-select: none;">
            <el-input style="width: 60%;margin-right: 10px;" size="mini" v-model="search" placeholder="请输入文件名..."></el-input>
            <el-button type="Info" size="mini" icon="el-icon-search" @click="searchFiles()">搜索</el-button>
          </el-form>
        </el-col>

        <el-col :span="6" style="text-align: right; float: right;">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              <i class="el-icon-s-tools el-icon--left"></i>
              操作
              <i class="el-icon-caret-bottom el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <!--               <el-dropdown-item icon="el-icon-plus">上传文件</el-dropdown-item> -->
              <el-dropdown-item icon="el-icon-upload2" @click.native="uploadFilesVisible = true">上传文件</el-dropdown-item>
              <el-dropdown-item icon="el-icon-link" @click.native="getHttpFile()">离线下载</el-dropdown-item>
              <el-dropdown-item icon="el-icon-document-add" @click.native="createNewFile()">新建文件</el-dropdown-item>
              <el-dropdown-item icon="el-icon-folder-add" @click.native="inputFolderName(nowFolder.path, nowFolder.depth + 1)">新建文件夹</el-dropdown-item>
              <el-dropdown-item icon="el-icon-scissors" @click.native="moveFiles()">{{ moveFilesFlag ? '粘贴（' + moveFilesArray.length + '）' : '剪切' }}</el-dropdown-item>
              <el-dropdown-item icon="el-icon-delete" @click.native="recycleFiles()">删除</el-dropdown-item>
              <el-dropdown-item icon="el-icon-refresh-right" @click.native="updateFiles(nowFolder.path, nowFolder.depth + 1)">刷新</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
        
        <el-dialog :modal-append-to-body="false" :visible.sync="feedback" width="350px">
          <span slot="title">
            <i class="el-icon-message el-icon--left"></i>
            发送反馈信息
          </span>
        
          <el-form label-position="left">
            <el-form-item :label-width="'0px'">
              <el-input type="textarea" :rows="6" v-model="emailContent" autocomplete="off" placeholder="请输入信息以反馈给开发者提升使用体验..."></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="feedback = false">取 消</el-button>
            <el-button type="primary" @click="sendFeedback()">发 送</el-button>
          </div>
        </el-dialog>

        <el-dialog :modal-append-to-body="false" :visible.sync="sendEmail" width="350px">
          <span slot="title">
            <i class="el-icon-message el-icon--left"></i>
            发送电子邮件
          </span>

          <el-form label-position="left">
            <el-form-item label="邮件标题" :label-width="'80px'"><el-input v-model="emailTitle" autocomplete="off" placeholder="请输入邮件标题..."></el-input></el-form-item>
            <el-form-item label="邮件内容" :label-width="'80px'">
              <el-input type="textarea" :rows="4" v-model="emailContent" autocomplete="off" placeholder="请输入邮件内容..."></el-input>
            </el-form-item>
            <el-form-item label="收件用户" :label-width="'80px'">
              <el-select style="width: 100%;" v-model="recipient" placeholder="请选择收件用户">
                <el-option label="所有用户" value="all"></el-option>
                <el-option v-for="user in users" :key="user.userUUID" :label="user.userName" :value="user.userUUID"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="sendEmail = false">取 消</el-button>
            <el-button type="primary" @click="sendAdminEmail()">发 送</el-button>
          </div>
        </el-dialog>

        <el-dialog v-if="flag" :modal-append-to-body="false" :visible.sync="uploadFilesVisible" :before-close="handleClose" width="400px">
          <span slot="title">
            <i class="el-icon-upload2 el-icon--left"></i>
            上传文件
          </span>

          <el-upload
            drag
            ref="upload"
            :action="uploadUrl"
            :http-request="uploadSectionFiles"
            multiple
            :on-change="changeUploadListData"
            :file-list="uploadFilesList"
            :auto-upload="false"
          >
            <i class="el-icon-upload avatar-uploader-icon-computer"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div> 
          </el-upload>

          <el-progress :text-inside="true" :stroke-width="26" :percentage="progressPercent" style="margin-top:40px;"></el-progress>

          <span slot="footer" class="dialog-footer">
            <el-button style="margin-left: 10px;" type="primary" size="small" @click="uploadFiles()">{{!uploadFlag ? '开始上传' : '后台传输'}}</el-button>
          </span>
        </el-dialog>
        
        <el-dialog v-else :modal-append-to-body="false" :visible.sync="uploadFilesVisible" :before-close="handleClose" width="350px">
          <span slot="title">
            <i class="el-icon-upload2 el-icon--left"></i>
            上传文件
          </span>
        
          <el-upload
            class="avatar-uploader"
            ref="upload"
            :action="uploadUrl"
            :http-request="uploadSectionFiles"
            multiple
            :on-change="changeUploadListData"
            :file-list="uploadFilesList"
            :auto-upload="false"
          >
            <i class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        
          <el-progress :text-inside="true" :stroke-width="26" :percentage="progressPercent" style="margin-top:40px;"></el-progress>
        
          <span slot="footer" class="dialog-footer">
            <!-- <el-button size="small" @click="handleClose">取 消</el-button> -->
            <el-button style="margin-left: 10px;" type="primary" size="small" @click="uploadFiles()">{{!uploadFlag ? '开始上传' : '后台传输'}}</el-button>
          </span>
        </el-dialog>
        
        <el-dialog :modal-append-to-body="false" :visible.sync="downloadFilesVisible" :before-close="handleDownloadClose" width="350px" style="margin-top: -40px;">
          <span slot="title">
            <i class="el-icon-download el-icon--left"></i>
            下载文件
          </span>
          
            <vue-q-art style="margin-left: 55px;margin-bottom: 15px;" :config="config"></vue-q-art>
        
            <el-button style="margin-left: 78px;margin-bottom: 25px;" @click="copyLink('share')" type="primary" icon="el-icon-share">复制分享链接</el-button>
            <el-button style="margin-left: 78px;margin-bottom: 25px;" @click="copyLink('download')" type="primary" icon="el-icon-download">复制下载链接</el-button>
            <el-button style="margin-left: 78px;" @click="copyLink('resource')" type="primary" icon="el-icon-document">复制资源链接</el-button>
        
          <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="CancelDownloadMyFile()">取 消</el-button>
            <el-button style="margin-left: 10px;" type="primary" size="small" @click="downloadMyFile()">确 定</el-button>
          </span>
        </el-dialog>
        
      </el-row>

      <el-col :span="24">
        <el-table
          class="body-table"
          :header-cell-style="{ color: '#000000' }"
          :data="files.slice((currentPage - 1) * pagesize, currentPage * pagesize)"
          :cell-class-name="cellClass"
          @selection-change="handleSelectionChange"
          @sort-change="sortchange"
        >
          <el-table-column sortable="custom" show-overflow-tooltip prop="filename" label="文件名" :width="flag ? '250' : '105'">
            <template slot-scope="scope">
              <span v-if="judgeFileType(scope.row.filename) === 1" class="folder" @click="accessFolder(scope.row.path, scope.row.depth + 1)">
                {{ scope.row.filename.replace('/', '') }}
              </span>
              <span v-else @click="downloadFile(scope.row.pathsUUID, scope.row.filename, scope.row.path)" style="cursor:pointer;">{{ scope.row.filename.replace('/', '') }}</span>
            </template>
          </el-table-column>

          <el-table-column show-overflow-tooltip header-align="center" align="center" sortable="custom" v-if="flag" prop="addTime" label="创建日期"></el-table-column>

          <el-table-column show-overflow-tooltip header-align="center" align="center" sortable="custom" prop="size" label="大小" :width="flag ? '' : '75'"></el-table-column>

          <el-table-column header-align="center" align="center" label="操作" :width="flag ? '200' : '90'">
            <template slot-scope="scope">
              <el-container v-if="judgeFileType(scope.row.filename) === 1">
                <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                  <el-link type="primary" :style="flag ? 'margin-right:10px;' : ''" @click="renameFile(scope.row.filename, scope.row.pathsUUID)">
                    <i class="el-icon-edit"></i>
                    编辑
                  </el-link>
                  <el-link type="primary" @click="recycleFile(scope.row.filename, scope.row.pathsUUID)">
                    <i class="el-icon-folder-delete"></i>
                    删除
                  </el-link>
                </el-main>
              </el-container>
              <el-container v-else-if="judgeFileType(scope.row.filename) === 2">
                <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                  <el-link type="primary" :style="flag ? 'margin-right:10px;' : ''" @click="playMusic(scope.row.pathsUUID)">
                    <i class="el-icon-video-play"></i>
                    播放
                  </el-link>
                  <el-link type="primary" @click="renameFile(scope.row.filename, scope.row.pathsUUID)">
                    <i class="el-icon-edit"></i>
                    编辑
                  </el-link>
                </el-main>
              </el-container>
              <el-container v-else-if="judgeFileType(scope.row.filename) === 3">
                <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                  <el-link type="primary" :style="flag ? 'margin-right:10px;' : ''" @click="playVideo(scope.row.pathsUUID)">
                    <i class="el-icon-video-play"></i>
                    播放
                  </el-link>
                  <el-link type="primary" @click="renameFile(scope.row.filename, scope.row.pathsUUID)">
                    <i class="el-icon-edit"></i>
                    编辑
                  </el-link>
                </el-main>
              </el-container>
              <el-container v-else-if="judgeFileType(scope.row.filename) === 4">
                <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                  <el-link type="primary" :style="flag ? 'margin-right:10px;' : ''" @click="showImages(scope.row.pathsUUID)">
                    <i class="el-icon-picture"></i>
                    查看
                  </el-link>
                  <el-link type="primary" @click="renameFile(scope.row.filename, scope.row.pathsUUID)">
                    <i class="el-icon-edit"></i>
                    编辑
                  </el-link>
                </el-main>
              </el-container>
              <el-container v-else-if="judgeFileType(scope.row.filename) === 5">
                <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                  <el-link type="primary" :style="flag ? 'margin-right:10px;' : ''" @click="showText(scope.row.pathsUUID)">
                    <i class="el-icon-document"></i>
                    查看
                  </el-link>
                  <el-link type="primary" @click="renameFile(scope.row.filename, scope.row.pathsUUID)">
                    <i class="el-icon-edit"></i>
                    编辑
                  </el-link>
                </el-main>
              </el-container>
              <el-container v-else-if="judgeFileType(scope.row.filename) === 6">
                <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                  <el-link type="primary" :style="flag ? 'margin-right:10px;' : ''" @click="showMdText(scope.row.pathsUUID)">
                    <i class="el-icon-document"></i>
                    查看
                  </el-link>
                  <el-link type="primary" @click="renameFile(scope.row.filename, scope.row.pathsUUID)">
                    <i class="el-icon-edit"></i>
                    编辑
                  </el-link>
                </el-main>
              </el-container>
              <el-container v-else>
                <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                  <el-link type="primary" :style="flag ? 'margin-right:10px;' : ''" @click="renameFile(scope.row.filename, scope.row.pathsUUID)">
                    <i class="el-icon-edit"></i>
                    编辑
                  </el-link>
                  <el-link type="primary" @click="recycleFile(scope.row.filename, scope.row.pathsUUID)">
                    <i class="el-icon-document-delete"></i>
                    删除
                  </el-link>
                </el-main>
              </el-container>
            </template>
          </el-table-column>

          <el-table-column align="center" type="selection" :width="flag ? '55' : ''"></el-table-column>
        </el-table>
      </el-col>

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
    </el-row>

    <viewer :images="images" @inited="inited"><img v-for="item in images" :src="item.src" :key="item.index" height="100" v-show="false" /></viewer>

    <aplayer ref="aplayer" :audio="audio" :lrcType="0" fixed :mini="false" :listFolded="true" :autoplay="true" v-if="musicFlag" />

    <div class="video-container" v-show="videoFlag">
      <d-player ref="dplayer" :options="options" class="video" :style="{ width: videoWidth - 40 + 'px', height: videoHeight - 88 + 'px' }"></d-player>
      <div class="video-bottombar">
        <ul id="pv-buttons">
          <li id="pv-bar-close" class="bar-right bar-button" @click="closeVideo()"><img src="../assets/preview-close.svg" class="img" /></li>
          <li id="pv-bar-raw" class="bar-right bar-button" @click="downloadVideoFile(nowVideo.pathsUUID, nowVideo.filename)"><img src="../assets/preview-raw.svg" class="img" /></li>
          <li id="pv-bar-next" class="bar-right bar-button" @click="nextVideo(nowVideoIndex)"><img src="../assets/preview-next.svg" class="img" /></li>
          <li id="pv-bar-idx" class="bar-right bar-label">{{ nowVideoIndex + 1 }}/{{ videoArray.length }}</li>
          <li id="pv-bar-prev" class="bar-right bar-button" @click="previousVideo(nowVideoIndex)"><img src="../assets/preview-prev.svg" class="img" /></li>
          <li class="bar-left bar-label">{{ nowVideo.filename }}</li>
        </ul>
      </div>
    </div>

    <div class="video-container" v-if="editorShow">
      <editor
        class="video"
        :style="{ width: videoWidth - 40 + 'px', height: videoHeight - 88 + 'px' }"
        ref="myEditor"
        :content="textContent"
        v-model="textContent"
        :options="editorOption"
        :lang="textLang"
        :theme="editorTheme"
        @init="editorInit"
      ></editor>

      <div class="video-bottombar">
        <ul id="pv-buttons">
          <li id="pv-bar-close" class="bar-right bar-button" @click="closeText()"><img src="../assets/preview-close.svg" class="img" /></li>
          <li id="pv-bar-raw" class="bar-right bar-button" @click="saveText()"><img src="../assets/icon_save_24px_522050_easyicon.net.png" class="img" /></li>
          <li id="pv-bar-next" class="bar-right bar-button">
            <el-dropdown size="mini" trigger="click">
              <span class="el-dropdown-link img aceButton"><i style="width: 24px; height: 24px; position: relative; top: 2px;" class="el-icon-brush"></i></span>
              <el-dropdown-menu class="project-dropdown" slot="dropdown">
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/ambiance')">ambiance</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/chaos')">chaos</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/chrome')">chrome</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/clouds')">clouds</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/clouds_midnight')">clouds_midnight</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/cobalt')">cobalt</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/crimson_editor')">crimson_editor</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/dawn')">dawn</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/dracula')">dracula</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/dreamweaver')">dreamweaver</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/eclipse')">eclipse</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/github')">github</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/gob')">gob</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/gruvbox')">gruvbox</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/idle_fingers')">idle_fingers</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/iplastic')">iplastic</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/katzenmilch')">katzenmilch</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/kr_theme')">kr_theme</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/kuroir')">kuroir</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/merbivore')">merbivore</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/merbivore_soft')">merbivore_soft</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/mono_industrial')">mono_industrial</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/monokai')">monokai</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/pastel_on_dark')">pastel_on_dark</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/solarized_dark')">solarized_dark</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/solarized_light')">solarized_light</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/sqlserver')">sqlserver</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/terminal')">terminal</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/textmate')">textmate</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/tomorrow')">tomorrow</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/tomorrow_night_blue')">tomorrow_night_blue</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/tomorrow_night_bright')">tomorrow_night_bright</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/tomorrow_night_eighties')">tomorrow_night_eighties</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/tomorrow_night')">tomorrow_night</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/twilight')">twilight</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/vibrant_ink')">vibrant_ink</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorTheme('ace/theme/xcode')">xcode</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </li>

          <li id="pv-bar-next" class="bar-right bar-button">
            <el-dropdown size="mini" trigger="click">
              <span class="el-dropdown-link img aceButton"><i style="width: 24px; height: 24px; position: relative; top: 2px;" class="el-icon-magic-stick"></i></span>
              <el-dropdown-menu class="project-dropdown" slot="dropdown">
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/apache_conf')">apache_conf</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/asciidoc')">asciidoc</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/assembly_x86')">assembly_x86</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/c_cpp')">c_cpp</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/css')">css</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/diff')">diff</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/django')">django</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/dockerfile')">dockerfile</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/gitignore')">gitignore</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/golang')">golang</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/groovy')">groovy</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/html')">html</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/ini')">ini</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/java')">java</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/javascript')">javascript</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/json')">json</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/jsp')">jsp</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/kotlin')">kotlin</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/latex')">latex</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/less')">less</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/lua')">lua</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/makefile')">makefile</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/markdown')">markdown</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/matlab')">matlab</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/mysql')">mysql</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/pascal')">pascal</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/perl')">perl</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/pgsql')">pgsql</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/php')">php</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/plain_text')">plain_text</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/powershell')">powershell</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/properties')">properties</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/python')">python</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/ruby')">ruby</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/sass')">sass</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/scheme')">scheme</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/scss')">scss</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/sh')">sh</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/snippets')">snippets</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/sql')">sql</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/sqlserver')">sqlserver</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/svg')">svg</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/swift')">swift</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/text')">text</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/typescript')">typescript</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/vbscript')">vbscript</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/xml')">xml</el-dropdown-item>
                <el-dropdown-item @click.native="changeEditorLang('ace/mode/yaml')">yaml</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </li>
          <li id="pv-bar-next" class="bar-right bar-button" @click="addEditorFontSize()">
            <span class="img aceButton"><i style="width: 24px; height: 24px; position: relative; top: 2px;" class="el-icon-plus"></i></span>
          </li>
          <li id="pv-bar-next" class="bar-right bar-button" @click="reduceEditorFontSize()">
            <span class="img aceButton"><i style="width: 24px; height: 24px; position: relative; top: 2px;" class="el-icon-minus"></i></span>
          </li>
          <li class="bar-left bar-label">{{ nowText.filename }}</li>
        </ul>
      </div>
    </div>
    
    <div class="video-container" v-if="editMd">
      
      <mavon-editor
        ref="md"
        v-model="mdText"
        :codeStyle="codeStyle"
        :ishljs="true"
        class="video"
        :style="{ width: videoWidth - 40 + 'px', height: videoHeight - 88 + 'px'}"
        @save="saveMdText"
        @imgAdd="imgAdd"
        @imgDel="imgDel"
       />
    
      <div class="video-bottombar">
        <ul id="pv-buttons">
          <li id="pv-bar-close" class="bar-right bar-button" @click="closeMdText()"><img src="../assets/preview-close.svg" class="img" /></li>
          <li id="pv-bar-raw" class="bar-right bar-button" @click="saveMdText()"><img src="../assets/icon_save_24px_522050_easyicon.net.png" class="img" /></li>

          <li class="bar-left bar-label">{{ nowText.filename }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import fileDownload from 'js-file-download';
import VueQArt from 'vue-qart';

export default {
  name: 'yun',
  data() {
    return {
      baseHost: '',
      fileHost: '',
      userSpaceSize: 1 * 1024 * 1024 * 1024,
      userName: '',
      flag: true,
      width: 3,
      search: '',
      uploadUrl: '',
      progressPercent: 0,
      uploadFilesCount: 0,
      uploadFilesList: [],
      uploadFilesVisible: false,
      uploadNowFolder: {},
      uploadFlag: false,
      downloadFilesVisible: false,
      downloadFilename: '',
      downloadUrl: '',
      shareUrl: '',
      resourceUrl: '',
      moveFilesArray: [],
      repeatFlag: false,
      moveFilesFlag: false,
      oldFolderPathsUUID: '',
      nowFolder: { filename: '/', depth: 0 },
      nowFolder_backup: {},
      filesSelection: [],
      folders: [],
      tempFiles: [],
      saveFiles: [],
      files: [],
      currentPage: 1, //初始页
      pagesize: 10, //    每页的数据
      test: '',
      pictureFlag: false,
      images: [],
      musicFlag: false,
      audio: [],
      options: {
        video: {
          url: ''
        }
      },
      videoWidth: document.documentElement.clientWidth, // 屏幕宽
      videoHeight: document.documentElement.clientHeight, // 屏幕高
      videoArray: [],
      nowVideo: {},
      nowVideoIndex: 0,
      videoFlag: false,
      totalSizes: 0,
      textContent: 'print("Hello world!");',
      editorTheme: 'monokai',
      editorShow: false,
      editorOption: {
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        tabSize: 4,
        fontSize: 16,
        showPrintMargin: false //去除编辑器里的竖线
      },
      editorFontSize: 16,
      nowText: {},
      textLang: 'python',
      sendEmail: false,
      emailTitle: '',
      emailContent: '',
      recipient: '',
      users: [],
      feedback: false,
      config: {
         value: 'https://baidu.com',
         imagePath: require('../assets/20201116104635.png'),
         filter: 'color'
      },
      editMd: false,
      mdText: '',
      codeStyle:'vs2015'
    };
  },
  components: {
    VueQArt
  },
  mounted() {
    window.addEventListener('resize', () => {
      this.videoWidth = document.documentElement.clientWidth;
      this.videoHeight = document.documentElement.clientHeight;
    });

    window.addEventListener('offline', () => {
      this.$message({
        message: '网络错误！请检查网络连接！',
        type: 'error'
      });
    });

    this.userName = this.$store.state.userName;
    // console.log(this.userName);

    if (this.userName == '') {
      this.$message({
        message: '用户未登录！即将返回登录页面',
        type: 'error'
      });

      clearTimeout(this.timer); //清除延迟执行
      this.timer = setTimeout(() => {
        //设置延迟执行
        this.$router.push({ path: '/login' });
      }, 1500);
    } else {
      this.baseHost = this.$store.state.baseHost;
      this.fileHost = this.$store.state.fileHost;
      this.userSpaceSize = this.userName == 'admin' ? this.$store.state.adminSpaceSize : this.$store.state.userSpaceSize;

      //       console.log(this.userSpaceSize);
      if(this.$cookies.isKey("editorTheme")) {
        this.editorTheme = this.$cookies.get("editorTheme");
      }
      
      if(this.$cookies.isKey("fontSize")) {
        this.editorOption.fontSize = parseInt(this.$cookies.get("fontSize"));
        this.editorFontSize = parseInt(this.$cookies.get("fontSize"));
      }

      this.uploadUrl = 'http://' + this.baseHost + '/pathsController/uploads';

      this.filesListInit();
    }
    
    

    if (this.isMobile()) {
      this.editorOption.fontSize = 12;
      this.editorFontSize = 12;
      this.flag = false;
      this.width = 6;
      // console.log("isMobile");
      
      if(this.$cookies.isKey("fontSize")) {
        this.editorOption.fontSize = parseInt(this.$cookies.get("fontSize"));
        this.editorFontSize = parseInt(this.$cookies.get("fontSize"));
      }
    }
  },
  watch: {
    search(val) {
      //普通的watch监听
      //       console.log("search: "+ val);
      if (val == '') {
        this.getFolderFiles(this.nowFolder.path, this.nowFolder.depth + 1);
      }
    }
  },
  methods: {
    isMobile: function() {
      let flag = navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
      );
      return flag;
    },
    changeData: function() {
      this.userName = this.$store.state.userName;
    },
    cellClass: function({ row, rowIndex, columnIndex }) {
      if (rowIndex === 0 && columnIndex === 4 && row.name === '../') {
        //         console.log(this.$refs.multipleTable);
        //         return 'cell-display';
        //           row.splice(0, 4);
      }
    },
    log: function(scope) {
      console.log(scope);
      console.log('-------------------------------');
    },
    filterTag: function(value, row, column) {
      console.log(value);
      console.log(row);
      console.log(column);
    },
    searchFiles: function() {
      if (this.search == '') {
        this.files = this.saveFiles;
        this.$message.warning('查询条件不能为空！');
        return;
      }
      
      this.$axios
        .post(
          'http://' + this.baseHost + '/pathsController/searchFiles',
          this.$qs.stringify({
            userUUID: this.$store.state.userUUID,
            lastPathsUUID: this.nowFolder.pathsUUID,
            search: this.search
          })
        )
        .then(response => {
          
          this.$message({
            message: '文件搜索成功！',
            type: 'success'
          });
          
          this.saveFiles = response.data.pathsDtosList;
          this.files = this.saveFiles;
          this.currentPage = 1;
          this.pagesize = 10;
          // this.totalSizes = response.data.totalSizes;
        })
        .catch(error => {
          console.log(error);
          this.$message({
            type: 'error',
            message: '文件搜索失败！服务器内部错误！'
          });
        });
    },
    loginOut: function() {
      this.$message({
        message: '退出登录成功！即将返回登录页面',
        type: 'warning'
      });

      this.$store.commit('saveUserName', '');
      this.$store.commit('saveUserUUID', '');
      
      if(this.$cookies.isKey("userUUID")) {
        this.$cookies.remove("userUUID");
      }

      clearTimeout(this.timer); //清除延迟执行
      this.timer = setTimeout(() => {
        //设置延迟执行
        this.$router.push({ path: '/login' });
      }, 1500);
    },
    goSetting: function() {
      this.$router.push({ path: '/setting' });
    },
    goChange: function() {
      this.$store.commit('saveSetting', false);
      this.$router.push({ path: '/change' });
    },
    goDelete: function() {
      this.$router.push({ path: '/delete' });
    },
    goEmail: function() {
      this.$router.push({ path: '/email' });
    },
    filesListInit: function() {
      //       this.$refs.aplayer.pause();
      var path = "";
      var depth = 0;
      if(this.$cookies.isKey("filePath")) {
        path = this.$cookies.get("filePath");
      }
      if(this.$cookies.isKey("fileDepth")) {
        depth = parseInt(this.$cookies.get("fileDepth"));
      }
      
      if(path != "" && depth != 0) {
        // console.log("mounted：" + path + "------------" + depth);
        
        this.$axios
          .post(
            'http://' + this.baseHost + '/pathsController/getDefaultFiles',
            this.$qs.stringify({
              userUUID: this.$store.state.userUUID,
              path: path,
              depth: depth
            })
          )
          .then(response => {
            this.saveFiles = response.data.pathsDtosList;
            this.files = this.saveFiles;
            this.totalSizes = response.data.totalSizes;
        
            this.folders = response.data.folders;
            this.nowFolder = response.data.nowFolder;
          })
          .catch(error => {
            console.log(error);
            this.$message({
              type: 'error',
              message: '获取文件列表失败！服务器内部错误！'
            });
          });
      }else{
        this.$axios
          .post(
            'http://' + this.baseHost + '/pathsController/getFiles',
            this.$qs.stringify({
              userUUID: this.$store.state.userUUID,
              path: '/',
              depth: 1
            })
          )
          .then(response => {
            this.saveFiles = response.data.pathsDtosList;
            this.files = this.saveFiles;
            this.totalSizes = response.data.totalSizes;
        
            this.nowFolder = { pathsUUID: response.data.rootPathUUID, filename: '/', path: '/', depth: 0 };
            this.folders.push(this.nowFolder);
        
            //         console.log(response.data.rootPathUUID);
          })
          .catch(error => {
            console.log(error);
            this.$message({
              type: 'error',
              message: '获取文件列表失败！服务器内部错误！'
            });
          });
      }
      
    },
    getEmailsInfo: function() {
      this.recipient = '';
      this.emailTitle = '';
      this.emailContent = '';
      this.$axios
        .post('http://' + this.baseHost + '/userController/getUsers', this.$qs.stringify({}))
        .then(response => {
          //         console.log(response.data.userSpace);
          this.users = response.data.usersList;
          for (var i = 0; i < this.users.length; i++) {
            if (this.users[i].userName == 'admin') {
              this.users.splice(i, 1);
              break;
            }
          }
          this.sendEmail = true;
          //         console.log(this.users);
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    getFolderFiles: function(path, depth) {
      // console.log("getFolderFiles：" + path + "--------" + depth);
      
      if(this.$cookies.isKey("filePath")) {
        this.$cookies.remove("filePath");
        this.$cookies.set("filePath", path, 24 * 60 * 60);
      }else{
        this.$cookies.set("filePath", path, 24 * 60 * 60);
      }
      
      if(this.$cookies.isKey("fileDepth")) {
        this.$cookies.remove("fileDepth");
        this.$cookies.set("fileDepth", depth, 24 * 60 * 60);
      }else{
        this.$cookies.set("fileDepth", depth, 24 * 60 * 60);
      }
      
      //       this.$refs.aplayer.pause();
      this.musicFlag = false;
      this.audio = [];

      this.search = '';
      var temp_folders = [];
      for (let i = 0; i < this.folders.length; i++) {
        if (this.folders[i].path == path && this.folders[i].depth == depth - 1) {
          if (this.folders[i].filename == '/') {
            temp_folders.push(this.folders[i]);
          }
          this.nowFolder = this.folders[i];
          break;
        }
        temp_folders.push(this.folders[i]);
      }
      this.folders = temp_folders;

      this.$axios
        .post(
          'http://' + this.baseHost + '/pathsController/getFiles',
          this.$qs.stringify({
            userUUID: this.$store.state.userUUID,
            path: path,
            depth: depth
          })
        )
        .then(response => {
          this.saveFiles = response.data.pathsDtosList;
          this.files = this.saveFiles;
          this.currentPage = 1;
          this.pagesize = 10;
          this.totalSizes = response.data.totalSizes;
        })
        .catch(error => {
          console.log(error);
          this.$message({
            type: 'error',
            message: '获取文件列表失败！服务器内部错误！'
          });
        });
    },
    inputFolderName: function(path, depth) {
      //       console.log(path, depth);
      this.$prompt('', '新建文件夹', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入新文件夹的名称......'
      }).then(({ value }) => {
          var illegalFolderSign = ['"', "'", '/', '\\', '*', '|', '<', '>', '&', '$', ':', '?'];
          var illegalFlag = false;

          for (let i = 0; i < illegalFolderSign.length; i++) {
            if (value.indexOf(illegalFolderSign[i]) != -1) {
              illegalFlag = true;
              break;
            }
          }

          if (value[0] == '.' || value[value.length - 1] == '.') {
            illegalFlag = true;
          }

          if (!illegalFlag) {
            //             console.log(value[0] + " " + path + " " + depth + " " + illegalFlag);
            this.$axios
              .post(
                'http://' + this.baseHost + '/pathsController/mkdir',
                this.$qs.stringify({
                  userUUID: this.$store.state.userUUID,
                  path: path,
                  depth: depth,
                  folder: value
                })
              )
              .then(response => {
                //             console.log(response.data);
                if (response.data.message == '') {
                  this.$message({
                    type: 'success',
                    message: '新文件夹创建成功！新文件夹名称为: ' + value
                  });
                } else {
                  this.$message({
                    type: 'error',
                    message: '新文件夹创建失败！ ' + response.data.message
                  });
                }

                this.saveFiles = response.data.pathsDtosList;
                this.files = this.saveFiles;
                this.currentPage = 1;
                this.pagesize = 10;
              })
              .catch(error => {
                console.log(error);
                this.$message({
                  type: 'error',
                  message: '新文件夹创建失败！服务器内部错误！'
                });
              });
          } else {
            this.$confirm('提示：文件夹名中不应含有：引号 / \\ * | < > & $ : ? 且不能以“.”开头或结尾。', '新建文件夹', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'error'
            })
              .then(() => {
                this.test = 1;
              })
              .catch(() => {
                this.test = 2;
              });
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消编辑'
          });
        });
    },
    createNewFile: function() {
      this.$prompt('', '新建文件', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入新文件的名称......'
      })
        .then(({ value }) => {
          var illegalFolderSign = ['"', "'", '/', '\\', '*', '|', '<', '>', '&', '$', ':', '?'];
          var illegalFlag = false;
      
          for (let i = 0; i < illegalFolderSign.length; i++) {
            if (value.indexOf(illegalFolderSign[i]) != -1) {
              illegalFlag = true;
              break;
            }
          }
      
          if (value[0] == '.' || value[value.length - 1] == '.') {
            illegalFlag = true;
          }
      
          if (!illegalFlag) {
            this.$axios
              .post(
                'http://' + this.baseHost + '/pathsController/createNewFile',
                this.$qs.stringify({
                  userUUID: this.$store.state.userUUID,
                  pathsUUID: this.nowFolder.pathsUUID,
                  newFileName: value
                })
              )
              .then(response => {
                //             console.log(response.data);
                if (response.data.message == '') {
                  this.$message({
                    type: 'success',
                    message: '新文件创建成功！新文件名称为: ' + value
                  });
                } else {
                  this.$message({
                    type: 'error',
                    message: '新文件创建失败！ ' + response.data.message
                  });
                }
      
                this.saveFiles = response.data.pathsDtosList;
                this.files = this.saveFiles;
                this.currentPage = 1;
                this.pagesize = 10;
              })
              .catch(error => {
                console.log(error);
                this.$message({
                  type: 'error',
                  message: '新文件夹创建失败！服务器内部错误！'
                });
              });
          } else {
            this.$confirm('提示：文件夹名中不应含有：引号 / \\ * | < > & $ : ? 且不能以“.”开头或结尾。', '新建文件夹', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'error'
            })
              .then(() => {
                this.test = 1;
              })
              .catch(() => {
                this.test = 2;
              });
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消编辑'
          });
        });
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
      } else if (filename.toLowerCase().indexOf('.md') != -1) {
        return 6;
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

      return 7;
    },
    getSearchFolder: async function(subPath, path, depth) {
      await this.$axios
        .post(
          'http://' + this.baseHost + '/pathsController/getFiles',
          this.$qs.stringify({
            userUUID: this.$store.state.userUUID,
            path: path,
            depth: depth
          })
        )
        .then(response => {
                  // console.log(response.data);
          // this.saveFiles = response.data.pathsDtosList;
          // this.files = this.saveFiles;
          // this.currentPage = 1;
          // this.pagesize = 10;
          // this.totalSizes = response.data.totalSizes;
          
          for(let i = 0; i < response.data.pathsDtosList.length; i++) {
            if(subPath.indexOf(response.data.pathsDtosList[i].path) != -1) {
              this.folders.push(response.data.pathsDtosList[i]);
              break;
            }
          }
        })
        .catch(error => {
          console.log(error);
          this.$message({
            type: 'error',
            message: '获取文件列表失败！服务器内部错误！'
          });
        });
    },
    accessFolder: function(path, depth) {
      //       this.$refs.aplayer.pause();
      
      // console.log("accessFolder：" + path + "----------" + depth);
      
      if(this.$cookies.isKey("filePath")) {
        this.$cookies.remove("filePath");
        this.$cookies.set("filePath", path, 24 * 60 * 60);
      }else{
        this.$cookies.set("filePath", path, 24 * 60 * 60);
      }
      
      if(this.$cookies.isKey("fileDepth")) {
        this.$cookies.remove("fileDepth");
        this.$cookies.set("fileDepth", depth, 24 * 60 * 60);
      }else{
        this.$cookies.set("fileDepth", depth, 24 * 60 * 60);
      }
      
      this.musicFlag = false;
      this.audio = [];
      
      if(this.search != '') {
        
        // console.log(this.nowFolder.depth + "-------" + depth);
        // console.log(this.nowFolder.path + "-------" + path);
        
        if (this.nowFolder.depth != 0) {
          this.folders.push(this.nowFolder);
        }
        
        if(this.nowFolder.depth < depth - 2) {
          
          // console.log(this.nowFolder);
          
        this.$axios
            .post(
              'http://' + this.baseHost + '/pathsController/getSearchFolders',
              this.$qs.stringify({
                userUUID: this.$store.state.userUUID,
                path: path,
                depth: depth
              })
            )
            .then(response => {
              
              this.folders = response.data.folders;
            })
            .catch(error => {
              console.log(error);
              this.$message({
                type: 'error',
                message: '获取文件列表失败！服务器内部错误！'
              });
            });
          
        }
        
        for (let i = 0; i < this.files.length; i++) {
          if (this.files[i].path == path && this.files[i].depth == depth - 1) {
            this.nowFolder = this.files[i];
            break;
          }
        }
        
        this.search = '';
      }else{
        for (let i = 0; i < this.files.length; i++) {
          if (this.files[i].path == path && this.files[i].depth == depth - 1) {
            if (depth >= 3) {
              this.folders.push(this.nowFolder);
            }
            this.nowFolder = this.files[i];
            break;
          }
        }
        
        this.$axios.post(
            'http://' + this.baseHost + '/pathsController/getFiles',
            this.$qs.stringify({
              userUUID: this.$store.state.userUUID,
              path: path,
              depth: depth
            })
          )
          .then(response => {
            //         console.log(response.data);
            this.saveFiles = response.data.pathsDtosList;
            this.files = this.saveFiles;
            this.currentPage = 1;
            this.pagesize = 10;
            this.totalSizes = response.data.totalSizes;
          })
          .catch(error => {
            console.log(error);
            this.$message({
              type: 'error',
              message: '获取文件列表失败！服务器内部错误！'
            });
          });
      }
      
    },
    goBack: function(path, depth) {
      // console.log("goBack：" + path + "--------" + depth);
      
      if(this.$cookies.isKey("filePath")) {
        this.$cookies.remove("filePath");
        this.$cookies.set("filePath", path, 24 * 60 * 60);
      }else{
        this.$cookies.set("filePath", path, 24 * 60 * 60);
      }
      
      if(this.$cookies.isKey("fileDepth")) {
        this.$cookies.remove("fileDepth");
        this.$cookies.set("fileDepth", depth, 24 * 60 * 60);
      }else{
        this.$cookies.set("fileDepth", depth, 24 * 60 * 60);
      }
      
      //       this.$refs.aplayer.pause();
      this.musicFlag = false;
      this.audio = [];

      //       console.log(filename + '  ' + depth);
      this.nowFolder = this.folders[this.folders.length - 1];
      if (this.folders.length > 1) {
        this.folders.pop();
      }

      this.$axios
        .post(
          'http://' + this.baseHost + '/pathsController/getFiles',
          this.$qs.stringify({
            userUUID: this.$store.state.userUUID,
            path: path,
            depth: depth
          })
        )
        .then(response => {
          this.saveFiles = response.data.pathsDtosList;
          this.files = this.saveFiles;
          this.currentPage = 1;
          this.pagesize = 10;
          // console.log(this.files.length);
          this.totalSizes = response.data.totalSizes;
        })
        .catch(error => {
          console.log(error);
          this.$message({
            type: 'error',
            message: '获取文件列表失败！服务器内部错误！'
          });
        });
    },
    renameFile: function(filename, pathsUUID) {
      var moveFilesFlag = false;
      for (let i = 0; i < this.moveFilesArray.length; i++) {
        if (pathsUUID == this.moveFilesArray[i].pathsUUID) {
          moveFilesFlag = true;
          this.$confirm('提示：重命名文件失败！编辑的文件是剪切板中要移动的文件！请先清空剪切板后再来执行本操作！', '编辑文件', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
          })
            .then(() => {
              this.test = 1;
            })
            .catch(() => {
              this.test = 2;
            });
          break;
        }
      }

      if (!moveFilesFlag) {
        var tips = filename.indexOf('/') == -1 ? '文件' : '文件夹';
        this.$prompt('请输入' + tips + '的新名称：', '编辑', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '请输入' + tips + '的新名称......',
          inputValue: filename.replace('/', '')
        })
          .then(({ value }) => {
            var illegalFolderSign = ['"', "'", '/', '\\', '*', '|', '<', '>', '&', '$', ':', '?'];
            var illegalFlag = false;

            for (let i = 0; i < illegalFolderSign.length; i++) {
              if (value.indexOf(illegalFolderSign[i]) != -1) {
                illegalFlag = true;
                break;
              }
            }

            if (value[0] == '.' || value[value.length - 1] == '.') {
              illegalFlag = true;
            }

            if (!illegalFlag) {
              this.$axios
                .post(
                  'http://' + this.baseHost + '/pathsController/renameFile',
                  this.$qs.stringify({
                    userUUID: this.$store.state.userUUID,
                    pathsUUID: pathsUUID,
                    newFilename: value
                  })
                )
                .then(response => {
                  //           console.log(response.data);
                  if(this.search == '') {
                    this.saveFiles = response.data.pathsDtosList;
                    this.files = this.saveFiles;
                    this.currentPage = 1;
                    this.pagesize = 10;
                  }
                })
                .catch(error => {
                  console.log(error);
                  this.$message({
                    type: 'error',
                    message: tips + '编辑失败！服务器内部错误！'
                  });
                });
                
                if(this.search != '') {
                  clearTimeout(this.timer); //清除延迟执行
                  this.timer = setTimeout(() => {
                    //设置延迟执行
                    this.updateFiles();
                  }, 500);
                }

              this.$message({
                type: 'success',
                message: tips + '编辑成功！' + tips + '新名称为: ' + value
              });
            } else {
              this.$confirm('提示：' + tips + '的名称中不应含有：引号 / \\ * | < > & $ : ? 且不能以“.”开头或结尾。', '编辑文件', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error'
              })
                .then(() => {
                  this.test = 1;
                })
                .catch(() => {
                  this.test = 2;
                });
            }
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '取消编辑'
            });
          });
      }
    },
    deleteFile: function(filename, pathsUUID) {
      var moveFilesFlag = false;
      for (let i = 0; i < this.moveFilesArray.length; i++) {
        if (pathsUUID == this.moveFilesArray[i].pathsUUID) {
          moveFilesFlag = true;
          break;
        }
      }

      if (!moveFilesFlag) {
        var tips = filename.indexOf('/') == -1 ? '文件' : '文件夹';
        this.$confirm('此操作将永久删除' + tips + ' [' + filename.replace('/', '') + '], 是否继续?', '删除' + tips, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.$axios
              .post(
                'http://' + this.baseHost + '/pathsController/delFile',
                this.$qs.stringify({
                  userUUID: this.$store.state.userUUID,
                  pathsUUID: pathsUUID
                })
              )
              .then(response => {
                //           console.log(response.data);
                if(this.search == '') {
                  this.saveFiles = response.data.pathsDtosList;
                  this.files = this.saveFiles;
                  this.currentPage = 1;
                  this.pagesize = 10;
                  this.totalSizes = response.data.totalSizes;
                }
              })
              .catch(error => {
                console.log(error);
                this.$message({
                  type: 'error',
                  message: tips + '删除失败！服务器内部错误！'
                });
              });
              
              if(this.search != '') {
                clearTimeout(this.timer); //清除延迟执行
                this.timer = setTimeout(() => {
                  //设置延迟执行
                  this.updateFiles();
                }, 500);
              }

            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
      } else {
        this.$confirm('提示：删除文件失败！删除的文件是剪切板中要移动的文件！请先清空剪切板后再来执行本操作！', '删除文件', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        })
          .then(() => {
            this.test = 1;
          })
          .catch(() => {
            this.test = 2;
          });
      }
    },
    handleSelectionChange: function(val) {
      this.filesSelection = val;
    },
    deleteFiles: function() {
      var moveFilesFlag = false;
      for (let i = 0; i < this.filesSelection.length; i++) {
        for (let j = 0; j < this.moveFilesArray.length; j++) {
          if (this.filesSelection[i].pathsUUID == this.moveFilesArray[j].pathsUUID) {
            moveFilesFlag = true;
            break;
          }
        }
      }

      if (!moveFilesFlag) {
        if (this.filesSelection.length != 0) {
          this.$confirm('提示：确定要彻底删除这' + this.filesSelection.length + '项么？该操作不可恢复！', '删除文件', {
            confirmButtonText: '全部删除',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              this.$axios
                .post(
                  'http://' + this.baseHost + '/pathsController/delFiles',
                  this.$qs.stringify({
                    userUUID: this.$store.state.userUUID,
                    lastPathsUUID: this.nowFolder.pathsUUID,
                    filesJsonArray: JSON.stringify(this.filesSelection)
                  })
                )
                .then(response => {
                  //             console.log(response.data);
                  if(this.search == '') {
                    this.saveFiles = response.data.pathsDtosList;
                    this.files = this.saveFiles;
                    this.currentPage = 1;
                    this.pagesize = 10;
                    this.totalSizes = response.data.totalSizes;
                  }
                })
                .catch(error => {
                  console.log(error);
                  this.$message({
                    type: 'error',
                    message: '文件删除失败！服务器内部错误！'
                  });
                });
                
                if(this.search != '') {
                  clearTimeout(this.timer); //清除延迟执行
                  this.timer = setTimeout(() => {
                    //设置延迟执行
                    this.updateFiles();
                  }, 800);
                }

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
      } else {
        this.$confirm('提示：删除文件失败！删除的文件中包含剪切板中要移动的文件！请先清空剪切板后再来执行本操作！', '删除文件', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        })
          .then(() => {
            this.test = 1;
          })
          .catch(() => {
            this.test = 2;
          });
      }
    },
    moveFiles: function() {
      if (this.moveFilesFlag) {
        this.$confirm('提示：确定将这' + this.moveFilesArray.length + '项移动到当前位置么？', '移动文件', {
          confirmButtonText: '全部移动',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            var flag = false;

            for (let i = 0; i < this.moveFilesArray.length; i++) {
              if (this.moveFilesArray[i].filename.indexOf('/') != -1) {
                
                if(this.nowFolder.depth == this.moveFilesArray[i].depth) {
                  if (this.nowFolder.path == this.moveFilesArray[i].path) {
                    flag = true;
                  
                    this.$message({
                      type: 'error',
                      message: '文件移动失败！无法将自身移动到子目录中！'
                    });
                  
                    break;
                  }
                }else if(this.nowFolder.depth > this.moveFilesArray[i].depth) {
                  if (this.nowFolder.path.indexOf(this.moveFilesArray[i].path) != -1) {
                    flag = true;
                  
                    this.$message({
                      type: 'error',
                      message: '文件移动失败！无法将自身移动到子目录中！'
                    });
                  
                    break;
                  }
                }
              }

              for (let j = 0; j < this.saveFiles.length; j++) {
                if (this.moveFilesArray[i].filename == this.saveFiles[j].filename) {
                  this.repeatFlag = true;

                  this.$message({
                    type: 'error',
                    message: '文件移动失败!当前目录下有重复的文件名！'
                  });

                  break;
                }
              }
            }

            if (!flag && !this.repeatFlag) {
              
              this.$axios
                .post(
                  'http://' + this.baseHost + '/pathsController/moveFiles',
                  this.$qs.stringify({
                    userUUID: this.$store.state.userUUID,
                    newPathsUUID: this.nowFolder.pathsUUID,
                    filesJsonArray: JSON.stringify(this.moveFilesArray)
                  })
                )
                .then(response => {
                  //               console.log(response.data);
                  if(this.search == '') {
                    this.saveFiles = response.data.pathsDtosList;
                    this.files = this.saveFiles;
                    this.currentPage = 1;
                    this.pagesize = 10;
                  }
                })
                .catch(error => {
                  console.log(error);
                  this.$message({
                    type: 'error',
                    message: '文件移动失败！服务器内部错误！'
                  });
                });
                
              if(this.search != '') {
                clearTimeout(this.timer); //清除延迟执行
                this.timer = setTimeout(() => {
                  //设置延迟执行
                  this.updateFiles();
                }, 500);
              }

              this.$message({
                type: 'success',
                message: '文件移动成功!'
              });
            }

            this.repeatFlag = false;
            this.moveFilesFlag = false;
            this.oldFolderPathsUUID = '';
            this.moveFilesArray = [];
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消移动'
            });

            this.moveFilesFlag = false;
            this.oldFolderPathsUUID = '';
            this.moveFilesArray = [];
          });
      } else {
        if (this.filesSelection.length != 0) {
          this.moveFilesFlag = true;
          this.oldFolderPathsUUID = this.nowFolder.pathsUUID;
          this.moveFilesArray = this.filesSelection;
        } else {
          this.$confirm('提示：您还未选择任何文件，请先选中一些文件后再执行本操作！', '移动文件', {
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
    },
    uploadFiles: function() {
      if(!this.uploadFlag) {
        if (this.uploadFilesList.length > 0) {
          this.uploadFlag = true;
          this.uploadNowFolder = this.nowFolder;
          this.$refs.upload.submit();
        } else {
          this.$message({
            type: 'warning',
            message: '请选择上传文件！'
          });
        }
      }else{
        this.uploadFilesVisible = false;
      }
      
      //       this.uploadFilesVisible = false;
      //       this.$refs.upload.clearFiles();
    },
    uploadSectionFiles: function(param) {
      var fileObj = param.file;

      var fileNameFlag = false;
      // for (let i = 0; i < this.saveFiles.length; i++) {
      //   if (this.saveFiles[i].filename == fileObj.name) {
      //     fileNameFlag = true;
      //     break;
      //   }
      // }

      if (!fileNameFlag) {
        var fileSize = 1 * 1024 * 1024 * 1024;
        if (fileObj.size <= fileSize) {
          var spaceSize = (this.userSpaceSize / (1024 * 1024) - this.totalSizes) * 1024 * 1024;

          //         console.log(this.userSpaceSize / (1024 * 1024));
          //         console.log(spaceSize);

          if (fileObj.size <= spaceSize) {
            var form = new FormData();
            // 文件对象
            form.append('userUUID', this.$store.state.userUUID);
            form.append('pathsUUID', this.nowFolder.pathsUUID);
            form.append('files', fileObj);
            this.$axios({
              method: 'post',
              url: 'http://' + this.baseHost + '/pathsController/uploads',
              headers: {
                'Content-Type': 'multipart/form-data'
              },
              data: form,
              onUploadProgress: progressEvent => {
                // progressEvent.loaded:已上传文件大小
                // progressEvent.total:被上传文件的总大小
                this.progressPercent = Number(((progressEvent.loaded / progressEvent.total) * 100).toFixed(2));
                // console.log(this.progressPercent);
                this.$NProgress.set(this.progressPercent / 100);
              }
            })
              .then(response => {
                for (let i = 0; i < this.uploadFilesList.length; i++) {
                  if (this.uploadFilesList[i].uid == fileObj.uid) {
                    this.uploadFilesList[i].status = 'success';
                    break;
                  }
                }
                //         console.log(response)
                this.$message({
                  type: 'success',
                  message: '文件 [' + fileObj.name + '] 上传成功'
                });

                //         console.log(fileObj);

                this.uploadFilesCount++;

                this.totalSizes = response.data.totalSizes;
                if (this.uploadFilesCount == this.uploadFilesList.length) {
                  this.uploadFlag = false;
                  this.uploadFilesList = [];
                  
                  if(this.uploadNowFolder.filename == this.nowFolder.filename && this.uploadNowFolder.path == this.nowFolder.path) {
                    this.saveFiles = response.data.pathsDtosList;
                    this.files = this.saveFiles;
                    this.currentPage = 1;
                    this.pagesize = 10;
                  }

                  clearTimeout(this.timer); //清除延迟执行
                  this.timer = setTimeout(() => {
                    //设置延迟执行
                    this.uploadFilesVisible = false;
                    this.$refs.upload.clearFiles();
                    this.progressPercent = 0;
                    this.uploadFilesCount = 0;
                    //         console.log(this.progressPercent);
                  }, 1500);
                }
              })
              .catch(error => {
                console.log(error);
                this.$message({
                  type: 'error',
                  message: '文件上传失败！服务器内部错误！'
                });
                this.uploadFilesVisible = false;
                this.$refs.upload.clearFiles();
                this.progressPercent = 0;
              });
          } else {
            for (let i = 0; i < this.uploadFilesList.length; i++) {
              if (this.uploadFilesList[i].uid == fileObj.uid) {
                this.uploadFilesList[i].status = 'fail';
                break;
              }
            }

            this.$message({
              type: 'error',
              message: '文件 [' + fileObj.name + '] 上传失败！空间不足！'
            });

            this.uploadFilesCount++;

            if (this.uploadFilesCount == this.uploadFilesList.length) {
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
                  this.currentPage = 1;
                  this.pagesize = 10;
                  this.totalSizes = response.data.totalSizes;
                })
                .catch(error => {
                  console.log(error);
                  this.$message({
                    type: 'error',
                    message: '获取文件列表失败！服务器内部错误！'
                  });
                });

              clearTimeout(this.timer); //清除延迟执行
              this.timer = setTimeout(() => {
                //设置延迟执行
                this.uploadFilesVisible = false;
                this.$refs.upload.clearFiles();
                this.progressPercent = 0;
                this.uploadFilesCount = 0;
                //         console.log(this.progressPercent);
              }, 1500);
            }
          }
        } else {
          this.$message({
            type: 'error',
            message: '文件 [' + fileObj.name + '] 上传失败！无法上传超过 1GB 大小的文件！'
          });
        }
      } else {
        this.$message({
          type: 'error',
          message: '文件 [' + fileObj.name + '] 上传失败！文件已存在！'
        });

        this.uploadFilesCount++;

        if (this.uploadFilesCount == this.uploadFilesList.length) {
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
              this.currentPage = 1;
              this.pagesize = 10;
              this.totalSizes = response.data.totalSizes;
            })
            .catch(error => {
              console.log(error);
              this.$message({
                type: 'error',
                message: '获取文件列表失败！服务器内部错误！'
              });
            });

          clearTimeout(this.timer); //清除延迟执行
          this.timer = setTimeout(() => {
            //设置延迟执行
            this.uploadFilesVisible = false;
            this.$refs.upload.clearFiles();
            this.progressPercent = 0;
            this.uploadFilesCount = 0;
            //         console.log(this.progressPercent);
          }, 1500);
        }
      }
    },
    handleClose: function() {
      this.uploadFilesVisible = false;
      this.$refs.upload.clearFiles();
    },
    changeUploadListData: function(file, fileList) {
      for(let i = 0; i < fileList.length - 1; i++) {
        for(let j = i + 1; j < fileList.length; j++) {
          if(fileList[i].name == fileList[j].name) {
            this.$message({
              type: 'warning',
              message: "无法添加文件到上传列表！上传文件列表中已存在文件 [" + fileList[j].name + "]！"
            });
            fileList.splice(j,1);
            j--;
          }
        }
      }
      
      for (let i = 0; i < fileList.length; i++) {
        for(let j = 0; j < this.saveFiles.length; j++) {
          if(fileList[i].name == this.saveFiles[j].filename) {
            this.$message({
              type: 'warning',
              message: "无法上传文件！当前文件夹中已存在文件 [" + fileList[i].name + "]！"
            });
            fileList.splice(i, 1);
            break;
          }
        }
      }
      
      this.test = file.uid;
      this.uploadFilesList = fileList;
      
      //       console.log(fileList);
      //       console.log(this.uploadFilesList);
      // if(fileList.length > 2) {
      //   console.log(fileList.length + "----------------" + fileList[fileList.length - 1].name);
      //   fileList.pop();
      //   console.log(fileList.length + "----------------" + fileList[fileList.length - 1].name);
      // }
    },
    fileDownLoad: function() {
      if (this.filesSelection.length != 0) {
        if (this.filesSelection.length == 1) {
          if (this.filesSelection[0].filename.indexOf('/') == -1) {
            this.$confirm('提示：您确认要下载文件：[' + this.filesSelection[0].filename + ']么？', '下载文件', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                this.$axios
                  .post(
                    'http://' + this.baseHost + '/pathsController/download',
                    this.$qs.stringify({
                      userUUID: this.$store.state.userUUID,
                      pathsUUID: this.filesSelection[0].pathsUUID
                    }),
                    {
                      responseType: 'arraybuffer'
                    }
                  )
                  .then(response => {
                    fileDownload(response.data, this.filesSelection[0].filename);
                  })
                  .catch(error => {
                    console.log(error);
                    this.$message({
                      type: 'error',
                      message: '文件下载失败！服务器内部错误！'
                    });
                  });
              })
              .catch(() => {
                this.$message({
                  type: 'info',
                  message: '取消下载！'
                });
              });
          } else {
            this.$confirm('提示：您选择了一个目录，请先选中一个文件后再执行本操作！', '下载文件', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'error'
            })
              .then(() => {
                this.test = 1;
              })
              .catch(() => {
                this.test = 2;
              });
          }
        } else {
          this.$confirm('提示：您选择了多个文件，请先选中一个文件后再执行本操作！', '下载文件', {
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
      } else {
        this.$confirm('提示：您还未选择任何文件，请先选中一个文件后再执行本操作！', '下载文件', {
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
    downloadFile: function(pathsUUID, filename, path) {
      
      this.downloadFilename = filename;
      this.downloadUrl = 'http://' + this.baseHost + '/pathsController/download?pathsUUID=' + pathsUUID;
      this.shareUrl = 'http://' + this.baseHost + '/share.html?f=' + pathsUUID;
      this.resourceUrl = encodeURIComponent('http://' + this.fileHost + '/fileSystem/' + this.userName + path);
      this.resourceUrl = this.resourceUrl.replace(/%3A/g, ':');
      this.resourceUrl = this.resourceUrl.replace(/%2F/g, '/');
      this.config.value = this.shareUrl;
      this.downloadFilesVisible = true;
      
    },
    downloadMyFile: function() {
      
      let ele = document.createElement('a');
      ele.download = this.downloadFilename;
      ele.href = this.downloadUrl;
      ele.style.display = 'none';
      document.body.appendChild(ele);
      ele.click();
      document.body.removeChild(ele);
      
      this.downloadFilename = '';
      this.downloadUrl = '';
      this.shareUrl = '';
      this.resourceUrl = '';
      this.config.value = '';
      this.downloadFilesVisible = false;
      
      clearTimeout(this.timer); //清除延迟执行
      this.timer = setTimeout(() => {
        //设置延迟执行
        this.$message({
          type: 'success',
          message: '文件即将开始下载！'
        });
      }, 800);
    },
    CancelDownloadMyFile: function() {
      this.$message({
        type: 'info',
        message: '取消下载！'
      });
      this.downloadFilename = '';
      this.downloadUrl = '';
      this.shareUrl = '';
      this.resourceUrl = '';
      this.config.value = '';
      this.downloadFilesVisible = false;
    },
    handleDownloadClose: function() {
      this.downloadFilename = '';
      this.downloadUrl = '';
      this.shareUrl = '';
      this.resourceUrl = '';
      this.downloadFilesVisible = false;
    },
    inited: function(viewer) {
      this.$viewer = viewer;
    },
    showImages: function(pathsUUID) {
      var pictures = [];

      for (let i = 0; i < this.saveFiles.length; i++) {
        if (this.saveFiles[i].pathsUUID == pathsUUID) {
          var imgs = 1;

          var url = encodeURIComponent('http://' + this.fileHost + '/fileSystem/' + this.userName + this.saveFiles[i].path);
          url = url.replace(/%3A/g, ':');
          url = url.replace(/%2F/g, '/');
          pictures.push({ src: url, index: i });

          for (let j = i + 1; j < this.saveFiles.length; j++) {
            if (
              this.saveFiles[j].filename.toLowerCase().indexOf('.jpg') != -1 ||
              this.saveFiles[j].filename.toLowerCase().indexOf('.jpeg') != -1 ||
              this.saveFiles[j].filename.toLowerCase().indexOf('.png') != -1
            ) {
              var _url = encodeURIComponent('http://' + this.fileHost + '/fileSystem/' + this.userName + this.saveFiles[j].path);
              _url = _url.replace(/%3A/g, ':');
              _url = _url.replace(/%2F/g, '/');
              pictures.push({ src: _url, index: j });

              imgs++;
              if (imgs == 10) {
                break;
              }
            }
          }

          if (imgs < 10) {
            for (let j = 0; j < i; j++) {
              if (
                this.saveFiles[j].filename.toLowerCase().indexOf('.jpg') != -1 ||
                this.saveFiles[j].filename.toLowerCase().indexOf('.jpeg') != -1 ||
                this.saveFiles[j].filename.toLowerCase().indexOf('.png') != -1
              ) {
                var n_url = encodeURIComponent('http://' + this.fileHost + '/fileSystem/' + this.userName + this.saveFiles[j].path);
                n_url = n_url.replace(/%3A/g, ':');
                n_url = n_url.replace(/%2F/g, '/');
                pictures.push({ src: n_url, index: j });

                imgs++;
                if (imgs == 10) {
                  break;
                }
              }
            }
          }

          //           this.$viewer.view(i);

          break;
        }
      }

      this.images = pictures;
      this.$viewer.show();
      //       this.pictureFlag = true;
      //       console.log(this.images);
    },
    playMusic: function(pathsUUID) {
      var musicArray = [];
      var cover = 'http://m.yongkj.cn/audio_default.png';

      for (let i = 0; i < this.saveFiles.length; i++) {
        if (this.saveFiles[i].pathsUUID == pathsUUID) {
          var musicUrl = encodeURIComponent('http://' + this.fileHost + '/fileSystem/' + this.userName + this.saveFiles[i].path);
          musicUrl = musicUrl.replace(/%3A/g, ':');
          musicUrl = musicUrl.replace(/%2F/g, '/');

          //           var musicUrl = encodeURI('http://' + this.baseHost + '/pathsController/download?pathsUUID=' + this.saveFiles[i].pathsUUID);

          if (this.saveFiles[i].filename.indexOf('-') != -1) {
            var names = this.saveFiles[i].filename.split('-');
            var artist = names[0];
            var musicNames = names[1].split('.');
            var musicName = musicNames[0];
            musicArray.push({ name: musicName, artist: artist, url: musicUrl, cover: cover, lrc: '' });
          } else {
            musicNames = this.saveFiles[i].filename.split('.');
            musicName = musicNames[0];
            artist = '群星';
            musicArray.push({ name: musicName, artist: artist, url: musicUrl, cover: cover, lrc: '' });
          }

          for (let j = i + 1; j < this.saveFiles.length; j++) {
            if (
              this.saveFiles[j].filename.toLowerCase().indexOf('.mp3') != -1 ||
              this.saveFiles[j].filename.toLowerCase().indexOf('.wav') != -1 ||
              this.saveFiles[j].filename.toLowerCase().indexOf('.flac') != -1
            ) {
              var _musicUrl = encodeURIComponent('http://' + this.fileHost + '/fileSystem/' + this.userName + this.saveFiles[j].path);
              _musicUrl = _musicUrl.replace(/%3A/g, ':');
              _musicUrl = _musicUrl.replace(/%2F/g, '/');
              //               var _musicUrl = encodeURI('http://' + this.baseHost + '/pathsController/download?pathsUUID=' + this.saveFiles[j].pathsUUID);

              if (this.saveFiles[j].filename.indexOf('-') != -1) {
                var _names = this.saveFiles[j].filename.split('-');
                var _artist = _names[0];
                var _musicNames = _names[1].split('.');
                var _musicName = _musicNames[0];
                musicArray.push({ name: _musicName, artist: _artist, url: _musicUrl, cover: cover, lrc: '' });
              } else {
                _musicNames = this.saveFiles[j].filename.split('.');
                _musicName = _musicNames[0];
                _artist = '群星';
                musicArray.push({ name: _musicName, artist: _artist, url: _musicUrl, cover: cover, lrc: '' });
              }
            }
          }

          for (let j = 0; j < i; j++) {
            if (
              this.saveFiles[j].filename.toLowerCase().indexOf('.mp3') != -1 ||
              this.saveFiles[j].filename.toLowerCase().indexOf('.wav') != -1 ||
              this.saveFiles[j].filename.toLowerCase().indexOf('.flac') != -1
            ) {
              var n_musicUrl = encodeURIComponent('http://' + this.fileHost + '/fileSystem/' + this.userName + this.saveFiles[j].path);
              n_musicUrl = n_musicUrl.replace(/%3A/g, ':');
              n_musicUrl = n_musicUrl.replace(/%2F/g, '/');
              //               var n_musicUrl = encodeURI('http://' + this.baseHost + '/pathsController/download?pathsUUID=' + this.saveFiles[j].pathsUUID);

              if (this.saveFiles[j].filename.indexOf('-') != -1) {
                var n_names = this.saveFiles[j].filename.split('-');
                var n_artist = n_names[0];
                var n_musicNames = n_names[1].split('.');
                var n_musicName = n_musicNames[0];
                musicArray.push({ name: n_musicName, artist: n_artist, url: n_musicUrl, cover: cover, lrc: '' });
              } else {
                n_musicNames = this.saveFiles[j].filename.split('.');
                n_musicName = n_musicNames[0];
                n_artist = '群星';
                musicArray.push({ name: n_musicName, artist: n_artist, url: n_musicUrl, cover: cover, lrc: '' });
              }
            }
          }

          break;
        }
      }

      this.audio = musicArray;
      this.musicFlag = true;

      clearTimeout(this.timer); //清除延迟执行
      this.timer = setTimeout(() => {
        //设置延迟执行
        this.$refs.aplayer.play();
      }, 1000);
    },
    updateFiles: function(path, depth) {
      if(this.search != '') {
        this.$axios
          .post(
            'http://' + this.baseHost + '/pathsController/searchFiles',
            this.$qs.stringify({
              userUUID: this.$store.state.userUUID,
              lastPathsUUID: this.nowFolder.pathsUUID,
              search: this.search
            })
          )
          .then(response => {
            
            this.saveFiles = response.data.pathsDtosList;
            this.files = this.saveFiles;
            this.currentPage = 1;
            this.pagesize = 10;
            // this.totalSizes = response.data.totalSizes;
          })
          .catch(error => {
            console.log(error);
            this.$message({
              type: 'error',
              message: '文件搜索失败！服务器内部错误！'
            });
          });
      }else{
        
        this.$axios
          .post(
            'http://' + this.baseHost + '/pathsController/getFiles',
            this.$qs.stringify({
              userUUID: this.$store.state.userUUID,
              path: path,
              depth: depth
            })
          )
          .then(response => {
            this.saveFiles = response.data.pathsDtosList;
            this.files = this.saveFiles;
            this.currentPage = 1;
            this.pagesize = 10;
            this.totalSizes = response.data.totalSizes;
          })
          .catch(error => {
            console.log(error);
            this.$message({
              type: 'error',
              message: '获取文件列表失败！服务器内部错误！'
            });
          });
      }
    },
    playVideo: function(pathsUUID) {
      var videos = [];
      for (let i = 0; i < this.saveFiles.length; i++) {
        if (this.saveFiles[i].pathsUUID == pathsUUID) {
          videos.push(this.saveFiles[i]);

          for (let j = i + 1; j < this.saveFiles.length; j++) {
            if (
              this.saveFiles[j].filename.toLowerCase().indexOf('.mp4') != -1 ||
              this.saveFiles[j].filename.toLowerCase().indexOf('.webm') != -1 ||
              this.saveFiles[j].filename.toLowerCase().indexOf('.mkv') != -1
            ) {
              videos.push(this.saveFiles[j]);
            }
          }

          for (let j = 0; j < i; j++) {
            if (
              this.saveFiles[j].filename.toLowerCase().indexOf('.mp4') != -1 ||
              this.saveFiles[j].filename.toLowerCase().indexOf('.webm') != -1 ||
              this.saveFiles[j].filename.toLowerCase().indexOf('.mkv') != -1
            ) {
              videos.push(this.saveFiles[j]);
            }
          }

          break;
        }
      }

      this.videoArray = videos;
      this.nowVideo = this.videoArray[0];
      this.nowVideoIndex = 0;

      var videoUrl = encodeURIComponent('http://' + this.fileHost + '/fileSystem/' + this.userName + this.nowVideo.path);
      videoUrl = videoUrl.replace(/%3A/g, ':');
      videoUrl = videoUrl.replace(/%2F/g, '/');

      //       console.log(videoUrl);
      //       var videoUrl = encodeURI('http://' + this.baseHost + '/pathsController/download?pathsUUID=' + this.nowVideo.pathsUUID);
      this.$refs.dplayer.dp.switchVideo({ url: videoUrl });

      this.videoFlag = true;
      clearTimeout(this.timer); //清除延迟执行
      this.timer = setTimeout(() => {
        //设置延迟执行
        this.$refs.dplayer.dp.play();
      }, 300);
    },
    previousVideo: function(index) {
      if (this.videoArray.length > 1) {
        if (index == 0) {
          this.nowVideoIndex = this.videoArray.length - 1;
        } else {
          this.nowVideoIndex--;
        }

        this.nowVideo = this.videoArray[this.nowVideoIndex];

        var videoUrl = encodeURIComponent('http://' + this.fileHost + '/fileSystem/' + this.userName + this.nowVideo.path);
        videoUrl = videoUrl.replace(/%3A/g, ':');
        videoUrl = videoUrl.replace(/%2F/g, '/');
        //          var videoUrl = encodeURI('http://' + this.baseHost + '/pathsController/download?pathsUUID=' + this.nowVideo.pathsUUID);
        this.$refs.dplayer.dp.switchVideo({ url: videoUrl });

        this.$refs.dplayer.dp.pause();
        clearTimeout(this.timer); //清除延迟执行
        this.timer = setTimeout(() => {
          //设置延迟执行
          this.$refs.dplayer.dp.play();
        }, 300);
      }
    },
    nextVideo: function(index) {
      if (this.videoArray.length > 1) {
        if (index == this.videoArray.length - 1) {
          this.nowVideoIndex = 0;
        } else {
          this.nowVideoIndex++;
        }

        this.nowVideo = this.videoArray[this.nowVideoIndex];

        var videoUrl = encodeURIComponent('http://' + this.fileHost + '/fileSystem/' + this.userName + this.nowVideo.path);
        videoUrl = videoUrl.replace(/%3A/g, ':');
        videoUrl = videoUrl.replace(/%2F/g, '/');
        //        var videoUrl = encodeURI('http://' + this.baseHost + '/pathsController/download?pathsUUID=' + this.nowVideo.pathsUUID);
        this.$refs.dplayer.dp.switchVideo({ url: videoUrl });

        this.$refs.dplayer.dp.pause();
        clearTimeout(this.timer); //清除延迟执行
        this.timer = setTimeout(() => {
          //设置延迟执行
          this.$refs.dplayer.dp.play();
        }, 300);
      }
    },
    closeVideo: function() {
      this.$refs.dplayer.dp.pause();
      this.videoFlag = false;
    },
    testAce: function() {
      console.log(this.$refs.myEditor.editor);
      console.log(this.$refs.myEditor.editor.getTheme());
      console.log(this.$refs.myEditor.editor.getFontSize());
      console.log(this.$refs.myEditor.editor.session.getMode());
      // this.editorShow = "twilight";
      this.$refs.myEditor.editor.setTheme('ace/theme/twilight');
      this.$refs.myEditor.editor.setFontSize(20);
      // console.log(this.$refs.editor.options.fontSize);
      // this.$refs.editor.options.fontSize = 20;
      // this.editorOption1.fontSize = 20;
      // this.$refs.editor.options = this.editorOption1;
      // console.log("----------------------------------");
      // console.log(this.$refs.editor.options.fontSize);
    },
    editorInit: function() {
      require('brace/ext/language_tools');

      require('brace/mode/apache_conf');
      require('brace/mode/asciidoc');
      require('brace/mode/assembly_x86');
      require('brace/mode/c_cpp');
      require('brace/mode/css');
      require('brace/mode/diff');
      require('brace/mode/django');
      require('brace/mode/dockerfile');
      require('brace/mode/gitignore');
      require('brace/mode/golang');
      require('brace/mode/groovy');
      require('brace/mode/html');
      require('brace/mode/ini');
      require('brace/mode/java');
      require('brace/mode/javascript');
      require('brace/mode/json');
      require('brace/mode/jsp');
      require('brace/mode/kotlin');
      require('brace/mode/latex');
      require('brace/mode/less');
      require('brace/mode/lua');
      require('brace/mode/makefile');
      require('brace/mode/markdown');
      require('brace/mode/matlab');
      require('brace/mode/mysql');
      require('brace/mode/pascal');
      require('brace/mode/perl');
      require('brace/mode/pgsql');
      require('brace/mode/php');
      require('brace/mode/plain_text');
      require('brace/mode/powershell');
      require('brace/mode/properties');
      require('brace/mode/python');
      require('brace/mode/ruby');
      require('brace/mode/sass');
      require('brace/mode/scheme');
      require('brace/mode/scss');
      require('brace/mode/sh');
      require('brace/mode/snippets');
      require('brace/mode/sql');
      require('brace/mode/sqlserver');
      require('brace/mode/svg');
      require('brace/mode/swift');
      require('brace/mode/text');
      require('brace/mode/typescript');
      require('brace/mode/vbscript');
      require('brace/mode/xml');
      require('brace/mode/yaml');

      require('brace/snippets/apache_conf');
      require('brace/snippets/asciidoc');
      require('brace/snippets/assembly_x86');
      require('brace/snippets/c_cpp');
      require('brace/snippets/css');
      require('brace/snippets/diff');
      require('brace/snippets/django');
      require('brace/snippets/dockerfile');
      require('brace/snippets/gitignore');
      require('brace/snippets/golang');
      require('brace/snippets/groovy');
      require('brace/snippets/html');
      require('brace/snippets/ini');
      require('brace/snippets/java');
      require('brace/snippets/javascript');
      require('brace/snippets/jsoniq');
      require('brace/snippets/jsp');
      require('brace/snippets/kotlin');
      require('brace/snippets/latex');
      require('brace/snippets/less');
      require('brace/snippets/lua');
      require('brace/snippets/makefile');
      require('brace/snippets/markdown');
      require('brace/snippets/matlab');
      require('brace/snippets/mysql');
      require('brace/snippets/pascal');
      require('brace/snippets/perl');
      require('brace/snippets/pgsql');
      require('brace/snippets/php');
      require('brace/snippets/plain_text');
      require('brace/snippets/powershell');
      require('brace/snippets/properties');
      require('brace/snippets/python');
      require('brace/snippets/ruby');
      require('brace/snippets/sass');
      require('brace/snippets/scheme');
      require('brace/snippets/scss');
      require('brace/snippets/sh');
      require('brace/snippets/snippets');
      require('brace/snippets/sql');
      require('brace/snippets/sqlserver');
      require('brace/snippets/svg');
      require('brace/snippets/swift');
      require('brace/snippets/text');
      require('brace/snippets/typescript');
      require('brace/snippets/vbscript');
      require('brace/snippets/xml');
      require('brace/snippets/yaml');

      // require("brace/theme/monokai");
      // require("brace/theme/twilight");
      require('brace/theme/ambiance');
      require('brace/theme/chaos');
      require('brace/theme/chrome');
      require('brace/theme/clouds');
      require('brace/theme/clouds_midnight');
      require('brace/theme/cobalt');
      require('brace/theme/crimson_editor');
      require('brace/theme/dawn');
      require('brace/theme/dracula');
      require('brace/theme/dreamweaver');
      require('brace/theme/eclipse');
      require('brace/theme/github');
      require('brace/theme/gob');
      require('brace/theme/gruvbox');
      require('brace/theme/idle_fingers');
      require('brace/theme/iplastic');
      require('brace/theme/katzenmilch');
      require('brace/theme/kr_theme');
      require('brace/theme/kuroir');
      require('brace/theme/merbivore');
      require('brace/theme/merbivore_soft');
      require('brace/theme/mono_industrial');
      require('brace/theme/monokai');
      require('brace/theme/pastel_on_dark');
      require('brace/theme/solarized_dark');
      require('brace/theme/solarized_light');
      require('brace/theme/sqlserver');
      require('brace/theme/terminal');
      require('brace/theme/textmate');
      require('brace/theme/tomorrow');
      require('brace/theme/tomorrow_night_blue');
      require('brace/theme/tomorrow_night_bright');
      require('brace/theme/tomorrow_night_eighties');
      require('brace/theme/tomorrow_night');
      require('brace/theme/twilight');
      require('brace/theme/vibrant_ink');
      require('brace/theme/xcode');
    },
    showText: function(pathsUUID) {
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

      var lang = [
        'asciidoc',
        'assembly_x86',
        'assembly_x86',
        'apache_conf',
        'c_cpp',
        'css',
        'c_cpp',
        'groovy',
        'golang',
        'html',
        'java',
        'json',
        'jsp',
        'javascript',
        'lua',
        'makefile',
        'markdown',
        'plain_text',
        'properties',
        'perl',
        'php',
        'powershell',
        'python',
        'python',
        'ruby',
        'sh',
        'svg',
        'sql',
        'typescript',
        'xml',
        'vbscript',
        'yaml'
      ];

      var flag = false;
      for (let i = 0; i < this.saveFiles.length; i++) {
        if (this.saveFiles[i].pathsUUID == pathsUUID) {
          for (let j = 0; j < text.length; j++) {
            if (this.saveFiles[i].filename.toLowerCase().indexOf(text[j]) != -1) {
              this.$axios
                .post(
                  'http://' + this.baseHost + '/pathsController/getText',
                  this.$qs.stringify({
                    userUUID: this.$store.state.userUUID,
                    pathsUUID: pathsUUID
                  })
                )
                .then(response => {
                  this.textContent = response.data.textContent;

                  this.nowText = this.saveFiles[i];
                  this.textLang = lang[j];

                  this.editorShow = true;
                })
                .catch(error => {
                  console.log(error);
                  this.$message({
                    type: 'error',
                    message: '获取文件内容失败！服务器内部错误！'
                  });
                });

              flag = true;
              break;
            }
          }
        }
        if (flag) {
          break;
        }
      }
    },
    saveText: function() {
      this.$axios
        .post(
          'http://' + this.baseHost + '/pathsController/saveText',
          this.$qs.stringify({
            userUUID: this.$store.state.userUUID,
            folderPathsUUID: this.nowFolder.pathsUUID,
            pathsUUID: this.nowText.pathsUUID,
            textContent: this.textContent
          })
        )
        .then(response => {
          this.saveFiles = response.data.pathsDtosList;
          this.files = this.saveFiles;
          this.currentPage = 1;
          this.pagesize = 10;
          this.totalSizes = response.data.totalSizes;

          this.$message({
            type: 'success',
            message: '保存文件内容成功！'
          });
        })
        .catch(error => {
          console.log(error);
          this.$message({
            type: 'error',
            message: '保存文件内容失败！服务器内部错误！'
          });
        });
    },
    closeText: function() {
      this.$confirm('提示：是否保存文件？', '保存文件', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$axios
            .post(
              'http://' + this.baseHost + '/pathsController/saveText',
              this.$qs.stringify({
                userUUID: this.$store.state.userUUID,
                folderPathsUUID: this.nowFolder.pathsUUID,
                pathsUUID: this.nowText.pathsUUID,
                textContent: this.textContent
              })
            )
            .then(response => {
              this.saveFiles = response.data.pathsDtosList;
              this.files = this.saveFiles;
              this.currentPage = 1;
              this.pagesize = 10;
              this.totalSizes = response.data.totalSizes;

              this.$message({
                type: 'success',
                message: '保存文件内容成功！'
              });
            })
            .catch(error => {
              console.log(error);
              this.$message({
                type: 'error',
                message: '保存文件内容失败！服务器内部错误！'
              });
            });

          this.editorShow = false;
        })
        .catch(() => {
          this.test = 2;

          this.editorShow = false;
        });
    },
    showMdText: function(pathsUUID) {
      for (let i = 0; i < this.saveFiles.length; i++) {
        if (this.saveFiles[i].pathsUUID == pathsUUID) {
          this.$axios.post('http://' + this.baseHost + '/pathsController/getText',
            this.$qs.stringify({
              userUUID: this.$store.state.userUUID,
              pathsUUID: pathsUUID
            })
          )
          .then(response => {
            this.mdText = response.data.textContent;
        
            this.nowText = this.saveFiles[i];
        
            this.editMd = true;
          })
          .catch(error => {
            console.log(error);
            this.$message({
              type: 'error',
              message: '获取文件内容失败！服务器内部错误！'
            });
          });
          break;
        }
      }
    },
    saveMdText: function() {
      this.$axios
        .post(
          'http://' + this.baseHost + '/pathsController/saveText',
          this.$qs.stringify({
            userUUID: this.$store.state.userUUID,
            folderPathsUUID: this.nowFolder.pathsUUID,
            pathsUUID: this.nowText.pathsUUID,
            textContent: this.mdText
          })
        )
        .then(response => {
          this.saveFiles = response.data.pathsDtosList;
          this.files = this.saveFiles;
          this.currentPage = 1;
          this.pagesize = 10;
          this.totalSizes = response.data.totalSizes;
      
          this.$message({
            type: 'success',
            message: '保存文件内容成功！'
          });
        })
        .catch(error => {
          console.log(error);
          this.$message({
            type: 'error',
            message: '保存文件内容失败！服务器内部错误！'
          });
        });
    },
    closeMdText: function() {
      this.$confirm('提示：是否保存文件？', '保存文件', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$axios
            .post(
              'http://' + this.baseHost + '/pathsController/saveText',
              this.$qs.stringify({
                userUUID: this.$store.state.userUUID,
                folderPathsUUID: this.nowFolder.pathsUUID,
                pathsUUID: this.nowText.pathsUUID,
                textContent: this.mdText
              })
            )
            .then(response => {
              this.saveFiles = response.data.pathsDtosList;
              this.files = this.saveFiles;
              this.currentPage = 1;
              this.pagesize = 10;
              this.totalSizes = response.data.totalSizes;
      
              this.$message({
                type: 'success',
                message: '保存文件内容成功！'
              });
            })
            .catch(error => {
              console.log(error);
              this.$message({
                type: 'error',
                message: '保存文件内容失败！服务器内部错误！'
              });
            });
      
          this.editMd = false;
        })
        .catch(() => {
          this.test = 2;
      
          this.editMd = false;
        });
    },
    imgAdd: function(pos, file) {
      // console.log(pos);
      // console.log(file);
      console.log()
      
      var form = new FormData();
      form.append('userUUID', this.$store.state.userUUID);
      form.append('pathsUUID', this.nowFolder.pathsUUID);
      form.append('mdTextName', this.nowText.filename);
      form.append('image', file);
      
      this.$axios({
        method: 'post',
        url: 'http://' + this.baseHost + '/pathsController/uploadMdImg',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: form
      })
        .then(response => {
          
          var url = encodeURIComponent('http://' + this.fileHost + '/fileSystem/' + this.userName + response.data.pathsDto.path);
          url = url.replace(/%3A/g, ':');
          url = url.replace(/%2F/g, '/');
          this.$refs.md.$img2Url(pos, url);
          
          this.saveFiles = response.data.pathsDtosList;
          this.files = this.saveFiles;
          this.currentPage = 1;
          this.pagesize = 10;
          this.totalSizes = response.data.totalSizes;
          
        })
        .catch(error => {
          console.log(error);
        });
    },
    imgDel: function(pos) {
      // console.log(pos);
      
      this.$axios.post(
          'http://' + this.baseHost + '/pathsController/delUploadMdImg',
          this.$qs.stringify({
            userUUID: this.$store.state.userUUID,
            pathsUUID: this.nowFolder.pathsUUID,
            mdTextName: this.nowText.filename,
            imageNameUrl: pos[0]
          })
        )
        .then(response => {
          this.saveFiles = response.data.pathsDtosList;
          this.files = this.saveFiles;
          this.currentPage = 1;
          this.pagesize = 10;
          this.totalSizes = response.data.totalSizes;
        })
        .catch(error => {
          console.log(error);
        });
    },
    sortchange: function(column) {
      if (column.prop == 'size') {
        if(column.order == 'ascending') {
          this.files.sort(this.sortByFileSizeASC);
        }else if(column.order == 'descending') {
          this.files.sort(this.sortByFileSizeDESC);
        }else{
          // console.log(column.prop);
          // console.log(column.order);
          
          if(this.search != '') {
            this.$axios
              .post(
                'http://' + this.baseHost + '/pathsController/searchFiles',
                this.$qs.stringify({
                  userUUID: this.$store.state.userUUID,
                  lastPathsUUID: this.nowFolder.pathsUUID,
                  search: this.search
                })
              )
              .then(response => {
                
                this.saveFiles = response.data.pathsDtosList;
                this.files = this.saveFiles;
                this.currentPage = 1;
                this.pagesize = 10;
                this.totalSizes = response.data.totalSizes;
              })
              .catch(error => {
                console.log(error);
                this.$message({
                  type: 'error',
                  message: '文件搜索失败！服务器内部错误！'
                });
              });
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
          
          // console.log('---------------');
        }
      }else if(column.prop == 'filename') {
        if(column.order == 'ascending') {
          this.files.sort(this.sortByFileNameASC);
        }else if(column.order == 'descending') {
          this.files.sort(this.sortByFileNameDESC);
        }else{
          // console.log(column.prop);
          // console.log(column.order);
          if(this.search != '') {
            this.$axios
              .post(
                'http://' + this.baseHost + '/pathsController/searchFiles',
                this.$qs.stringify({
                  userUUID: this.$store.state.userUUID,
                  lastPathsUUID: this.nowFolder.pathsUUID,
                  search: this.search
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
                  message: '文件搜索失败！服务器内部错误！'
                });
              });
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
          // console.log('---------------');
        }
      }else if(column.prop == 'addTime') {
        if(column.order == 'ascending') {
          this.files.sort(this.sortByFileDateASC);
        }else if(column.order == 'descending') {
          this.files.sort(this.sortByFileDateDESC);
        }else{
          // console.log(column.prop);
          // console.log(column.order);
          if(this.search != '') {
            this.$axios
              .post(
                'http://' + this.baseHost + '/pathsController/searchFiles',
                this.$qs.stringify({
                  userUUID: this.$store.state.userUUID,
                  lastPathsUUID: this.nowFolder.pathsUUID,
                  search: this.search
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
                  message: '文件搜索失败！服务器内部错误！'
                });
              });
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
          // console.log('---------------');
        }
      }
    },
    getHttpFile: function() {
      this.$prompt('', '离线下载', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入文件下载链接(仅支持HTTP/HTTPS)......'
      })
        .then(({ value }) => {
          value = value.replace(/\(/g, '%28');
          value = value.replace(/\)/g, '%29');

          var url = /^(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]$/;
          if (url.test(value)) {
            this.nowFolder_backup = this.nowFolder;
            this.$message({
              type: 'info',
              message: '服务器正在下载文件！请耐心等待！'
            });

            this.$axios
              .post(
                'http://' + this.baseHost + '/pathsController/getHttpFile',
                this.$qs.stringify({
                  pathsUUID: this.nowFolder.pathsUUID,
                  fileUrl: value
                })
              )
              .then(response => {
                //           console.log(response.data);
                if (response.data.message == '') {
                  if (this.nowFolder_backup.pathsUUID == this.nowFolder.pathsUUID) {
                    this.saveFiles = response.data.pathsDtosList;
                    this.files = this.saveFiles;
                    this.currentPage = 1;
                    this.pagesize = 10;
                  }
                  this.totalSizes = response.data.totalSizes;

                  this.$message({
                    type: 'success',
                    message: '文件 [' + response.data.fileName + '] 下载成功！'
                  });
                } else {
                  this.$message({
                    type: 'error',
                    message: '服务器下载文件失败！' + response.data.message
                  });
                }
              })
              .catch(error => {
                console.log(error);
                this.$message({
                  type: 'error',
                  message: '服务器下载文件失败！服务器内部错误！'
                });
              });
          } else {
            this.$message({
              type: 'error',
              message: '请输入正确的url链接'
            });
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消上传链接！'
          });
        });
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
    addEditorFontSize: function() {
      this.editorFontSize++;
      this.editorOption.fontSize = this.editorFontSize;
      this.$refs.myEditor.editor.setFontSize(this.editorFontSize);
      // console.log(this.editorFontSize);
      
      if(this.$cookies.isKey("fontSize")) {
        this.$cookies.remove("fontSize");
        this.$cookies.set("fontSize", this.editorFontSize, 24 * 60 * 60);
      }else{
        this.$cookies.set("fontSize", this.editorFontSize, 24 * 60 * 60);
      }
    },
    reduceEditorFontSize: function() {
      this.editorFontSize--;
      this.editorOption.fontSize = this.editorFontSize;
      this.$refs.myEditor.editor.setFontSize(this.editorFontSize);
      // console.log(this.editorFontSize);
      
      if(this.$cookies.isKey("fontSize")) {
        this.$cookies.remove("fontSize");
        this.$cookies.set("fontSize", this.editorFontSize, 24 * 60 * 60);
      }else{
        this.$cookies.set("fontSize", this.editorFontSize, 24 * 60 * 60);
      }
    },
    changeEditorTheme: function(theme) {
      this.$refs.myEditor.editor.setTheme(theme);
      this.editorTheme = theme.slice(10, theme.length);
      // console.log(theme.slice(10, theme.length));
      
      if(this.$cookies.isKey("editorTheme")) {
        this.$cookies.remove("editorTheme");
        this.$cookies.set("editorTheme", theme.slice(10, theme.length), 24 * 60 * 60);
      }else{
        this.$cookies.set("editorTheme", theme.slice(10, theme.length), 24 * 60 * 60);
      }
    },
    changeEditorLang: function(lang) {
      this.$refs.myEditor.editor.session.setMode(lang);
    },
    sendAdminEmail: function() {
      this.sendEmail = false;
      this.$message({
        message: '邮件正在发送中，请耐心等待！',
        type: 'info'
      });
      this.$axios
        .post('http://' + this.baseHost + '/userController/sendAdminEmail', this.$qs.stringify({
          emailTitle: this.emailTitle,
          emailContent: this.emailContent,
          userUUID: this.recipient
        }))
        .then(response => {
          if(response.data.message == '') {
            this.$message({
              message: '邮件发送成功！',
              type: 'success'
            });
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    openFeedback: function() {
      this.emailContent = '';
      this.feedback = true;
    },
    sendFeedback: function() {
      this.feedback = false;
      this.$message({
        message: '反馈信息正在发送中，请耐心等待！',
        type: 'info'
      });
      this.$axios
        .post('http://' + this.baseHost + '/userController/sendUserFeedback', this.$qs.stringify({
          userUUID: this.$store.state.userUUID,
          emailContent: this.emailContent
        }))
        .then(response => {
          if(response.data.message == '') {
            this.$message({
              message: '反馈信息发送成功！感谢您的反馈，祝您生活愉快！',
              type: 'success'
            });
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    sortByFileDateASC: function(obj1, obj2) {
      // console.log(obj1);
      // console.log(obj2);
      // return 0;
      var date1 = new Date(obj1.addTime);
      var date2 = new Date(obj2.addTime);
      
      var s1 = parseFloat(date1.getTime() / 1000);
      var s2 = parseFloat(date2.getTime() / 1000);
      
      // console.log(s1);
      // console.log(s2);
      
      return s1 - s2;
    },
    sortByFileDateDESC: function(obj1, obj2) {
      // console.log(obj1);
      // console.log(obj2);
      // return 0;
      var date1 = new Date(obj1.addTime);
      var date2 = new Date(obj2.addTime);
      
      var s1 = parseFloat(date1.getTime() / 1000);
      var s2 = parseFloat(date2.getTime() / 1000);
      
      // console.log(s1);
      // console.log(s2);
      
      return s2 - s1;
    },
    sortByFileSizeASC: function(obj1, obj2) {
      // console.log(obj1);
      // console.log(obj2);
      // return 0;
      var size1 = 0;
      if(obj1.size != "--") {
        size1 = parseFloat(obj1.size.slice(0, obj1.size.length - 2));
      }
      var size2 = 0;
      if(obj2.size != "--") {
        size2 = parseFloat(obj2.size.slice(0, obj2.size.length - 2));
      }
      // console.log(size1);
      // console.log(size2);
      return size1 - size2;
    },
    sortByFileSizeDESC: function(obj1, obj2) {
      // console.log(obj1);
      // console.log(obj2);
      // return 0;
      var size1 = 0;
      if(obj1.size != "--") {
        size1 = parseFloat(obj1.size.slice(0, obj1.size.length - 2));
      }
      var size2 = 0;
      if(obj2.size != "--") {
        size2 = parseFloat(obj2.size.slice(0, obj2.size.length - 2));
      }
      // console.log(size1);
      // console.log(size2);
      return size2 - size1;
    },
    sortByFileNameASC: function(obj1, obj2) {
      return obj1.filename.localeCompare(obj2.filename, 'zh-CN');
    },
    sortByFileNameDESC: function(obj1, obj2) {
      return obj2.filename.localeCompare(obj1.filename, 'zh-CN');
    },
    checkboxInit: function() {
      if(this.search == '') {
        return 1;
      }else{
        return 0;
      }
    },
    copyLink: function(operate) {
      var text = '';
      var choose = '';
      if(operate == "share") {
        text = this.shareUrl;
        choose = '分享';
      }else if(operate == "resource") {
        text = this.resourceUrl;
        choose = '资源';
      }else{
        text = this.downloadUrl;
        choose = '下载';
      }
      this.$copyText(text).then(
        res => {
          // console.log(res)
          this.test = res.text;
          // this.$toast("已成功复制，可直接去粘贴");
          this.downloadFilesVisible = false;
          this.$message({
            type: 'success',
            message: choose + '链接复制成功！'
          });
        },
        err => {
          console.log(err)
          // this.$toast("复制失败");
          this.$message({
            type: 'error',
            message: choose + '链接复制失败！'
          });
        }
      )
    },
    downloadVideoFile: function(pathsUUID, filename) {
      var url = 'http://' + this.baseHost + '/pocketyun/pathsController/download?pathsUUID=' + pathsUUID;
      this.$confirm('提示：您确认要下载文件：[' + filename + '] 么？', '下载文件', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        let ele = document.createElement('a');
        ele.download = filename;
        ele.href = url;
        ele.style.display = 'none';
        document.body.appendChild(ele);
        ele.click();
        document.body.removeChild(ele);

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消下载！'
        });
      });
    },
    goRecycle: function() {
      this.$router.push({ path: '/recycle' });
    },
    recycleFile: function(filename, pathsUUID) {
      var moveFilesFlag = false;
      for (let i = 0; i < this.moveFilesArray.length; i++) {
        if (pathsUUID == this.moveFilesArray[i].pathsUUID) {
          moveFilesFlag = true;
          break;
        }
      }

      if (!moveFilesFlag) {
        var tips = filename.indexOf('/') == -1 ? '文件' : '文件夹';
        this.$confirm('此操作将删除' + tips + ' [' + filename.replace('/', '') + '], 是否继续?', '删除' + tips, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.$axios
              .post(
                'http://' + this.baseHost + '/pathsController/recycleFile',
                this.$qs.stringify({
                  userUUID: this.$store.state.userUUID,
                  pathsUUID: pathsUUID
                })
              )
              .then(response => {
                //           console.log(response.data);
                if(this.search == '') {
                  this.saveFiles = response.data.pathsDtosList;
                  this.files = this.saveFiles;
                  this.currentPage = 1;
                  this.pagesize = 10;
                  this.totalSizes = response.data.totalSizes;
                }
              })
              .catch(error => {
                console.log(error);
                this.$message({
                  type: 'error',
                  message: tips + '删除失败！服务器内部错误！'
                });
              });
              
              if(this.search != '') {
                clearTimeout(this.timer); //清除延迟执行
                this.timer = setTimeout(() => {
                  //设置延迟执行
                  this.updateFiles();
                }, 500);
              }

            this.$message({
              type: 'success',
              message: tips + '删除成功！已存入文件回收站！'
            });
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
      } else {
        this.$confirm('提示：删除文件失败！删除的文件是剪切板中要移动的文件！请先清空剪切板后再来执行本操作！', '删除文件', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        })
          .then(() => {
            this.test = 1;
          })
          .catch(() => {
            this.test = 2;
          });
      }
    },
    recycleFiles: function() {
      var moveFilesFlag = false;
      for (let i = 0; i < this.filesSelection.length; i++) {
        for (let j = 0; j < this.moveFilesArray.length; j++) {
          if (this.filesSelection[i].pathsUUID == this.moveFilesArray[j].pathsUUID) {
            moveFilesFlag = true;
            break;
          }
        }
      }

      if (!moveFilesFlag) {
        if (this.filesSelection.length != 0) {
          this.$confirm('提示：确定要删除这' + this.filesSelection.length + '项文件吗？', '删除文件', {
            confirmButtonText: '全部删除',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              this.$axios
                .post(
                  'http://' + this.baseHost + '/pathsController/recycleFiles',
                  this.$qs.stringify({
                    userUUID: this.$store.state.userUUID,
                    lastPathsUUID: this.nowFolder.pathsUUID,
                    filesJsonArray: JSON.stringify(this.filesSelection)
                  })
                )
                .then(response => {
                  //             console.log(response.data);
                  if(this.search == '') {
                    this.saveFiles = response.data.pathsDtosList;
                    this.files = this.saveFiles;
                    this.currentPage = 1;
                    this.pagesize = 10;
                    this.totalSizes = response.data.totalSizes;
                    this.filesSelection = [];
                  }
                })
                .catch(error => {
                  console.log(error);
                  this.$message({
                    type: 'error',
                    message: '文件删除失败！服务器内部错误！'
                  });
                });
                
                if(this.search != '') {
                  clearTimeout(this.timer); //清除延迟执行
                  this.timer = setTimeout(() => {
                    //设置延迟执行
                    this.updateFiles();
                  }, 800);
                }

              this.$message({
                type: 'success',
                message: '文件删除成功！已存入文件回收站！'
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
      } else {
        this.$confirm('提示：删除文件失败！删除的文件中包含剪切板中要移动的文件！请先清空剪切板后再来执行本操作！', '删除文件', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
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
};
</script>

<style scoped>
@import '../assets/css/style.css';

#yun {
  background: url('../assets/Emilia.jpg') no-repeat top;
  background-size: cover;
  background-attachment: fixed;
  position: fixed;
  height: 100%;
  width: 100%;
  overflow: scroll;
  z-index: -1;
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
.head {
  margin: 0 auto;
  margin-top: 0;
  border-bottom: 1px solid white;
  position: relative;
  z-index: 3;
}
.head-logo {
  font-size: 22px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 5px;
  /*     color: #9370DB; */
  /*     color: #20B2AA; */
  color: #42a3b3;
  user-select: none;
  text-align: left;
}
.head-col {
  padding-top: 20px;
  padding-bottom: 10px;
  padding-right: 10px;
  /*     color: #337AB7; */
  cursor: pointer;
  color: #409eff;
  text-align: right;
}
.body {
  margin: 0 auto;
  margin-top: 20px;
  margin-bottom: 20px;
  box-shadow: 0 0 25px rgba(155, 89, 182, 0.5);
  position: relative;
  z-index: 3;
}
.body-table {
  color: black;
  /* border-bottom-right-radius: 4px;
    border-bottom-left-radius: 4px; */
}

.menu {
  width: 100%;
  background: white;
  border-bottom: 1px solid #ebeef5;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  padding: 12px;
  position: relative;
  z-index: 3;
}
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.search {
  width: 50%;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar-uploader-icon-computer {
  font-size: 100px;
  color: #8c939d;
  width: 220px;
  height: 190px;
  line-height: 125px;
  /* padding-bottom: 15px; */
  position: relative;
  bottom: 40px;
  text-align: center;
}
.el-upload__text {
  color: #606266;
  font-size: 14px;
  text-align: center;
  position: relative;
  bottom: 125px;
}

.el-upload__text em {
  color: #409EFF;
  font-style: normal
}
.folder {
  color: #409eff;
  cursor:pointer;
}
.folder:hover {
  color: #409eff;
  border-bottom: 1px solid #409eff;
}
.video-container {
  width: 100%;
  height: 100%;
  bottom: 0;
  position: fixed;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  text-align: center;
}
.video {
  left: 20px;
  top: 20px;
}
.video-bottombar {
  box-shadow: 0 1px 10px 0 rgba(0, 0, 0, 0.5);
  position: fixed;
  z-index: 5;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1b1b1b;
  height: 48px;
  font-size: 13px;
}
#pv-buttons {
  list-style: none;
  list-style-image: none;
  margin: 0;
  padding: 0;
}
.bar-right {
  float: right;
}
.bar-left {
  float: left;
}
.bar-button {
  transition: all 0.2s ease-in-out;
  display: block;
  line-height: 48px;
  opacity: 0.7;
  cursor: pointer;
}
.bar-label {
  transition: all 0.2s ease-in-out;
  display: block;
  color: #fff;
  height: 48px;
  line-height: 48px;
  padding: 0 12px;
  opacity: 0.7;
}
.img {
  padding: 12px;
}
.img:hover {
  padding: 12px;
  background: #323232;
  color: white;
}
.aceButton {
  color: white;
  font-size: 20px;
  font-weight: 900;
}
.fullscreen {
  background: #212121;
}
.page {
  width: 100%;
  height: 53px;
  margin: 0 auto;
  background-color: white;
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
.project-dropdown {
  height: 600px;
  overflow: auto;
}
.project-dropdown::-webkit-scrollbar {
  width: 5px;
  height: 5px;
  background-color: #f5f5f5;
}
.project-dropdown::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: #f5f5f5;
}
.ace_editor::-webkit-scrollbar {
  display: block !important;
}
.hljs::-webkit-scrollbar {
  display: block;
  height: 10px;
}
::-webkit-scrollbar {
    display: none;
}
/*定义滑块颜色+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #3E3D42;
}

/*定义滚动条轨道内阴影+圆角*/
::-webkit-scrollbar-track {
  border-radius: 10px;
}
</style>
