  //通知后台后清除用户退出的动作
  var loginUrl = "";
  var clearCheckLogoutStatusAjax = $.get('login.do?action=clearCheckUserInfoStatus');
  //end

  var _onlytask = false;
  /**
   * 初始化桌面
   * @param onlytask 是否只显示任务
   */
  function initDesktop(onlytask) {
    setTimeout("document.all.searchTX.value = ''", 100);
    initTaskGroupType();
    getTask('0', _grouptype, false); //取任务
    getNotifyCount(); //取通知数量
    initShortcut(); //初始常用功能
    showtips(); //显示上次登录ip和时间
  }


  /**
   * 等出系统
   */
  function logout() {
    window.self.location.href = "login.do?action=out";
  }

  var notsendStatus = false; //不告诉后台清除状态,给打开门户的时候使用
  /**
   * 关闭窗口，要进入action中清空session中的缓存
   */
  function winexit() { //当窗口不再加载时自动调用该方法
    if (notsendStatus == true)
      return;

    //告诉后台，当前用户退出窗口
    var url = "login.do";
    var myAjax = new Ajax.Request(
      url, {
        method: 'post',
        parameters: "action=addLogoutUserInfoStatus",
        onSuccess: function(request) {},
        onFailure: function(request) {}
      }
    );
  }

  var winObjArr = []; //打开的窗口对象

  function setOpenWinObj(winobj) {
    winObjArr.push(winobj);
  }

  function closeWindow() {
    var needConfirm = false;
    if (winObjArr.length > 0) {
      for (var i = 0; i < winObjArr.length; i++) {
        if (winObjArr[i] != undefined && winObjArr[i] != null) {
          try {
            if (!winObjArr[i].closed) {
              needConfirm = true;
              break;
            }
          } catch (er) {}
        }
      }
    }

    if (needConfirm) {
      if (!confirm("您有正打开且未关闭的表单，是否确认关闭系统？")) { //暂时不保存
        return;
      }
    } else {
      if (!confirm("是否关闭系统？")) { //暂时不保存
        return;
      }
    }

    //关闭已经打开的窗口
    for (var i = 0; i < winObjArr.length; i++) {
      if (winObjArr[i] != undefined && winObjArr[i] != null) {
        try {
          winObjArr[i].close();
        } catch (e) {}
      }
    }
    //不用退出了，winexit()里面会调用登出
    //window.open("login.do?action=out","","width=1,height=1,left=0,top=0");
    window.opener = null;
    window.close();
  }

  function reLogin() {

    var needConfirm = false;
    if (winObjArr.length > 0) {
      for (var i = 0; i < winObjArr.length; i++) {
        if (winObjArr[i] != undefined && winObjArr[i] != null) {
          try {
            if (!winObjArr[i].closed) {
              needConfirm = true;
              break;
            }
          } catch (er) {}
        }
      }
    }

    if (needConfirm) {
      if (!confirm("您有正打开且未关闭的表单，是否确认重新登录？")) { //暂时不保存
        return;
      }
    }

    //关闭已经打开的窗口
    for (var i = 0; i < winObjArr.length; i++) {
      if (winObjArr[i] != undefined && winObjArr[i] != null) {
        try {
          winObjArr[i].close();
        } catch (e) {}
      }
    }

    window.location.href = './login.do?action=relogin';
  }

  function changeRole() {
    var url = "login.do";
    var inparam = "action=getRoleList";
    var retValue = window.showModalDialog(url + "?" + inparam, '', 'dialogHeight:500px; dialogWidth:550px;center:yes;scrollbars=yes;resizable=yes;help=no;status=no;');
    if (retValue == "")
      return;
    var id = retValue.split(",")[0];
    var name = retValue.split(",")[1];
    var myAjax = new Ajax.Request(
      url, {
        method: 'post',
        asynchronous: false,
        parameters: "action=setCurRole&roleid=" + id,
        onSuccess: function(request) {
          if (!name)
            $("corpSP").innerHTML = "";
          else
            $("corpSP").innerHTML = "当前角色:" + name;
        },
        onFailure: function(request) {}
      }
    );
  }

  function showtips() {

    //是否需求显示 ：true,显示
    var needshowtips = "<%=needshowtips%>";
    //最后一次登陆的Ip地址
    var lastLoginIpAddr = "<%=lastLoginIpAddr%>";
    //最后一次登陆的时间
    var lastLoginTime = "<%=lastLoginTime%>";

    if (needshowtips && needshowtips == "true") {

      var title = "登陆信息";
      var contentTime = "您上次登录时间为 ：" + lastLoginTime;
      var contentIp = "上次登录IP地址为 ：" + lastLoginIpAddr;
      var divTip = document.createElement("div");
      divTip.id = "tip";

      divTip.innerHTML = "<div id='title' style='text-align:left;font-size: 14px; height: 25px; line-height: 25px; background-color: #0066CC; color: #FFFFFF; padding: 0px 3px 0px 3px;filter: Alpha(Opacity=100);'>" +
        "<a style='float: right;text-decoration: none;color: #FFFFFF;' href='javascript:void(0)' onclick='start()'>X</a>" +
        title + "</div><p style='font-size:11px;text-align:left;padding: 20px 6px 6px 6px; '>" +
        contentTime + "</p><p style='font-size:11px;text-align:left;padding: 20px 6px 6px 6px; '>" + contentIp + "</p>";

      divTip.style.height = '0px';
      divTip.style.right = '0px';
      divTip.style.bottom = '0px';
      divTip.style.width = '260px';
      divTip.style.bottom = '0px';
      divTip.style.position = 'fixed';
      divTip.style.border = '1px solid #CCCCCC';
      divTip.style.backgroundColor = '#eeeeee';
      divTip.style.padding = '1px';
      divTip.style.overflow = 'hidden';
      divTip.style.display = 'none';
      divTip.style.fontSize = '10px';
      divTip.style.zIndex = '10';

      document.body.appendChild(divTip);

      window.setTimeout("start()", 10);
    }
  }

  var handle;

  function start(count) {

    var obj = document.getElementById("tip");
    if (parseInt(obj.style.height) == 0) {

      obj.style.display = "block";
      handle = setInterval("changeHeight('up')", 20);

      window.setTimeout("start()", 5000);
    } else {
      handle = setInterval("changeHeight('down')", 20)
    }


  }

  function changeHeight(str) {

    var obj = document.all ? document.all["tip"] : document.getElementById("tip");
    if (str == "up") {
      if (parseInt(obj.style.height) > 100) {

        clearInterval(handle);
      } else {
        obj.style.height = (parseInt(obj.style.height) + 70).toString() + "px";
      }
    }

    if (str == "down") {

      if (parseInt(obj.style.height) < 70) {

        clearInterval(handle);
        obj.style.display = "none";
      } else {

        obj.style.height = (parseInt(obj.style.height) - 70).toString() + "px";
      }
    }
  }

  //判断有没有预警
  $.get('login.do?action=getWarningFuncid', function(response) {
    var text = response.responseText;
    if (text.indexOf("ok-") >= 0) {
      var fid = text.substring(text.indexOf("ok-") + 3);
      openWarningFunc(fid);
    }
  });

  //打开预警菜单
  function openWarningFunc(funcid) {
    var t = "2";
    var w = 1000;
    var h = 612;
    var left = (1024 - w) / 2;
    var top = (768 - h) / 2;
    try {
      left = (window.screen.width - w) / 2;
      top = (window.screen.height - h) / 2;
    } catch (e) {}

    new Ajax.Request("system/formpubmodule/jsp/formPubModule.do", {
      method: 'post',
      parameters: "action=getFuncType&id=" + funcid,
      asynchronous: false,
      onSuccess: function(request) {
        t = request.responseText;
      },
      onFailure: function(request) {}
    });
    window.open("flow.do?action=load&funcId=" + funcid + t + "&openWin=F", "",
      "width=" + w + ",height=" + h + ",toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no,left=" +
      left + ",top=" + top);
  }

  $.get('login.do?action=getWarningSystemFuncid', function(response) {
    var text = request.responseText;
    if (text.indexOf("ok-") >= 0) {
      var fids = text.substring(text.indexOf("ok-") + 3);

      var fidArr = fids.split(";", -1);
      for (var i = 0; i < fidArr.length; i++) {
        if (!fidArr[i])
          continue;
        openWarningSystemFunc(fidArr[i]);
      }
    }
  });


  //打开预警菜单
  function openWarningSystemFunc(funcid) {
    var t = "2";
    var w = 1000;
    var h = 612;
    var left = (1024 - w) / 2;
    var top = (768 - h) / 2;
    try {
      left = (window.screen.width - w) / 2;
      top = (window.screen.height - h) / 2;
    } catch (e) {}

    new Ajax.Request("system/formpubmodule/jsp/formPubModule.do", {
      method: 'post',
      parameters: "action=getFuncType&id=" + funcid,
      asynchronous: false,
      onSuccess: function(request) {
        t = request.responseText;
      },
      onFailure: function(request) {}
    });
    window.open("flow.do?action=load&funcId=" + funcid + t + "&openWin=F", "",
      "width=" + w + ",height=" + h + ",toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no,left=" +
      left + ",top=" + top);
  }

  function changePassword() {
    passwordUtility.openSetPwdDialog({
      cancelable: true
    });
  }

  function openWebparam() {
    window.open("system/webparam/jsp/setparams.jsp", "_blank", "width=" + (screen.availWidth - 8) + ",height=" + (screen.availHeight - 34) + ",toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no,left=0,top=0");
  }

  function showOnlineUser() {
    window.open("system/webparam/jsp/showOnlineUser.jsp", "_blank", "width=" + (screen.availWidth - 8) + ",height=" + (screen.availHeight - 34) + ",toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no,left=0,top=0");
  }

  //显示等待窗口
  function showLoading(isshow, msg, isshowWait) {
    var msgT = "数据加载中，请稍等……";
    if (!msg) msg = msgT;
    try {
      var wd = window.document.body.offsetWidth; //document.body.getAttribute("bdwidth");//window.document.body.offsetWidth;
      var ht = window.document.body.offsetHeight; //document.body.getAttribute("bdheight");//window.document.body.offsetHeight;

      //$("loading").style.width = wd;
      //$("loading").style.height =ht;

      if (isshowWait == undefined || isshowWait != "1") {
        $("loading_main").style.top = (parseInt(ht, 10) - 60) / 2;
        $("loading_main").style.left = (parseInt(wd, 10) - 240) / 2;
      }
      //		if($("loading").isset == "0"){
      //
      //			$("loading").isset = "1";
      //		}

      var show = (isshow == "1") ? "" : "none";

      //$("loading").style.cursor = (isshow=="1")?'wait':'default';
      document.body.style.cursor = (isshow == "1") ? 'wait' : 'default';

      if (isshowWait == undefined || isshowWait != "1") {
        $("loading_msg").innerHTML = msg;
        $("loading_main").style.display = show;
      } else
        $("loading_main").style.display = "none";

      //$("loading").style.display= show;
    } catch (err) {}
  }

  /**
   * 刷新用户访问时间
   */
  function refreshAccessTimeCookice() {
    var expires = new Date();
    expires.setTime(expires.getTime() + (3 * 30 * 24 * 60 * 60 * 1000));
    document.cookie = "ULGT=" + (new Date().getTime()) + "; expires=" + expires.toGMTString();
  }
  setInterval('refreshAccessTimeCookice()', 3000); //每3秒写一次cookice

  /**
   * 从cookice中取出用户名和部门名
   */
  function setUserNameByCookice() {
    var userName = decodeURIComponent(decodeURIComponent(decodeURIComponent(decodeURIComponent(decodeURIComponent(getCookie("LUN"))))));

    //去掉;
    userName = userName.replace(/;/g, "");
    try {
      $("usernameSP").innerHTML = "欢迎您，" + userName;
    } catch (err) {
      //debugger;
    }
  }

  function getCookie(Name) {
    var search = Name + "=";
    if (document.cookie.length > 0) {
      var offset = document.cookie.indexOf(search);
      if (offset != -1) {
        offset += search.length;
        var end = document.cookie.indexOf(";", offset);
        if (end == -1) end = document.cookie.length;
        return unescape(document.cookie.substring(offset, end));
      } else return "";
    }
  }
  //设置5秒从cookice中取出用户名和部门名
  setInterval('setUserNameByCookice()', 5000);

  //当前显示内容的大细
  function getWindowSize() {
    var myWidth = 0,
      myHeight = 0;
    if (typeof(window.innerWidth) == 'number') {
      //Non-IE
      myWidth = window.innerWidth;
      myHeight = window.innerHeight;
    } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
      //IE 6+ in 'standards compliant mode'
      myWidth = document.documentElement.clientWidth;
      myHeight = document.documentElement.clientHeight;
    } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
      //IE 4 compatible
      myWidth = document.body.clientWidth;
      myHeight = document.body.clientHeight;
    }
    return {
      "width": myWidth,
      "height": myHeight
    };
  }

  function textToHtml(s) {
    if (s == undefined || s == null) return "";
    return String(s).replace(/<|>|\n|&/gi, _textToHtml);
  }

  function _textToHtml(s) {
    switch (s) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      default:
        return s;
    }
  }

  function openMyForm(type, admin) {

    var url = "";
    if (type == "F") {
      url = "system/formmanager/jsp/formBill.do?action=main&propValue=formmode=0;showCondi=0;showPersonCondi=0;showDateCondi=0;status=0,1,0,0,0,0;autoquery=1;showBtn=m;versontype=3;"; //showCondi=1;showBtn=A-M-I-V;";
    }
    if (type == "F2") {
      if (admin != "1") { //普通用户
        url = "system/formmanager/jsp/formBill.do?action=main&propValue=formmode=0;showCondi=0;showPersonCondi=0;showDateCondi=0;status=0,1,0,0,0,0;autoquery=1;showBtn=m;versontype=2;&notShowTree=1"; //showCondi=1;showBtn=A-M-I-V;";
      } else { //管理员
        url = "system/formmanager/jsp/formBill.do?action=main&propValue=formmode=1;showCondi=1;showPersonCondi=1;showDateCondi=1;status=1,1,1,0,0,1;autoquery=1;showStyle=-;showBtn=V-H;versontype=2;showFiterBtn=A-B-C-D-E;&notShowTree=1"; //showCondi=1;showBtn=A-M-I-V;";
      }
    }

    var w = 990;
    var h = 500;
    var left = (1024 - w) / 2;
    var top = (768 - h) / 2;
    try {
      left = (window.screen.width - w) / 2;
      top = (window.screen.height - h) / 2;
    } catch (e) {}
    window.open(url, "_blank",
      "width=" + w + ",height=" + h + ",toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no,left=" +
      left + ",top=" + top);
  }
