var _tasktype = "0";
var _grouptype = "D";
var _taskNotifyType = ""; //T 任务， N 通知
var _selTaskId = "";
var isInitTree = false; //是否已经初始化业务树

function changTaskStyle(type) {
  for (var i = 0; i < 3; i++) {
    $("#tasktypeA" + i).css("color", "#000000");
  }

  if (type == "0")
    $("#tasktypeA0").css("color", "rgb(65, 146, 175)");
  else if (type == "1")
    $("#tasktypeA1").css("color", "rgb(229, 165, 66)");
  else if (type == "2")
    $("#tasktypeA2").css("color", "rgb(66, 176, 215)");
}

/**
 * 取任务
 * @param ttype 任务类型，待办、在途等
 * @param gtype 分类类型，日期、业务等
 * @param useFilter 第一次取任务不需要过滤条件爱你
 */
function getTask(ttype, gtype, useFilter) {

  _tasktype = ttype;
  _grouptype = gtype;

  setTaskGroupTypeToCookice();

  changTaskStyle(ttype);

  var filter = $("searchTX").value;
  if (false == useFilter) {
    filter = "";
    setTimeout("document.all,searchTX.value = ''", 100);
  }

  if (_grouptype == "T") {
    $("#yworderDIV").show();
  } else {
    $("#yworderDIV").hide();
  }

  //TODO
  $("#yworderDIV").show();

  showLoading("1", "任务加载中,请稍候...");

  //var json = "";
  //TODO
  // var url1 = "loadMain.do?action=loadTaskByAjax&taskType=" + ttype + "&taskGpType=" + gtype + "&filter=" + encodeURIComponent(filter);
  var url1 = 'datas/tasks.json';
  $.get(url1, function(response) {
    getTask_complete(response.responseText);
  }).fail(function() {
    getTask_complete("error:取任务失败！");
  })
}


function setTaskWorkOrder() {

  //计算窗口的打开位置为居中
  var top = (768 - 450) / 2;
  var left = (1024 - 550) / 2;
  try {
    left = (window.screen.width - 550) / 2;
    top = (window.screen.height - 450) / 2;
  } catch (e) {}
  window.open("settaskworkorder.do?action=show&tasktype=" + _tasktype + "", "", "width=550,height=450,toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no,left=" + left + ",top=" + top);
}


function showFilter() {
  $("searchTX").style.display = ($("searchTX").style.display == "none") ? "" : "none";
}

function filterTaskByKey(e) {

  //只有按下enter才搜索数据
  if (e.keyCode != 13) {
    return;
  }
  filterTask(e);
}

function filterTask(e, isRefresh) {

  //只有按下enter才搜索数据
  //	if(e.keyCode!=13){
  //		return;
  //	}

  if (isRefresh == true)
    showLoading("1", "正在刷新中,请稍候...");
  else
    showLoading("1", "搜索中,请稍候...");

  var filter = $("searchTX").value;

  if (_taskNotifyType == "N") { //通知过滤
    getNotify("", filter);
    return;
  }

  var url1 = "loadMain.do";
  var myAjax = new Ajax.Request(
    url1, {
      method: 'post',
      parameters: "action=loadTaskByAjax&taskType=" + _tasktype + "&taskGpType=" + _grouptype + "&filter=" + encodeURIComponent(filter),
      onSuccess: function(request) {
        getTask_complete(request.responseText, "T");
      },
      onFailure: function(request) {
        getTask_complete("error:取任务失败！");
      }
    }
  );

}

function getTask_complete(json, taskNotifyType) {
  if (json.indexOf("name=\"loginForm\"") >= 0 && json.indexOf("login.do") >= 0) {
    var reLG = ajaxCheckIsLogin(json);
  }
  return getTask_complete_lower(json, taskNotifyType);

  var dataDiv = $("task_data_div");
  dataDiv.innerHTML = ""; //清空原来的数据，加载新的数据

  if (json.indexOf("error") >= 0) {
    var msg = json.substring("error:".length);
    showLoading("0", "");
    alert(msg);
    return;
  }

  if (isEmpty(json)) { //没有数据
    //清空记录数
    if (taskNotifyType == "N") //通知
      setCount("notifyCount", -1);
    else
      setCount("taskCount", -1);

    showLoading("0", "");
    return;
  }


  var jsonObj = eval('(' + json + ')');

  var htmlArr = [];

  //加上任务的记录数
  var total = jsonObj["total"];
  if (taskNotifyType == "N") //通知
    setCount("notifyCount", total);
  else {
    if (_tasktype == "0")
      setCount("taskCount", total);
  }

  var titleArr = jsonObj["titleinfo"];
  var dataObj = jsonObj["data"];

  for (var i = 0; i < titleArr.length; i++) {
    var titles = titleArr[i];
    var tid = titles[0];
    var title = titles[1];
    var size = titles[2];

    var dblclickEvt = "";
    if (_grouptype == "T") //按业务才需要
      dblclickEvt = ' ondblclick="autoSubmit(\'' + title + '\')" ';

    //分类头
    htmlArr.push('<div id="' + tid + '" class="md-no-sticky md-subheader _md" onclick="expandTask(\'' + tid + '\')" ' + dblclickEvt + ' style="cursor:pointer;">\n');
    htmlArr.push('	<div class="md-subheader-inner">\n');
    htmlArr.push('		<div class="md-subheader-content">\n');
    htmlArr.push('			<span class="ng-scope">' + title + ' （ <span id="num_sp_' + tid + '">' + size + '</span> 条 ）</span>\n');
    htmlArr.push('		</div>\n');
    htmlArr.push('	</div>\n');
    htmlArr.push('</div>\n');

    var groupDisplay = "";
    if (taskNotifyType == "N" && i < titleArr.length - 1) {
      groupDisplay = "display:none;";
    }

    htmlArr.push('<div id="taskgroup_' + tid + '" style="' + groupDisplay + '">\n'); //用来进行折叠的div
    //数据
    var datas = dataObj[tid];
    for (var j = 0; j < datas.length; j++) {
      var obj = datas[j];
      var id = obj[0];
      var titleid = obj[1];
      var desc = obj[2];
      var date = obj[3];
      var username = obj[4];
      var status = obj[5];
      var sortmemo = obj[6];
      var priority = obj[7];
      var funcid = obj[8];
      var wtype = obj[9];
      var toptask = obj[10];
      var canbatch = obj[11];
      var fontColor = obj[12];
      var comefromindex = obj[13];

      fontColor = (fontColor + "").replace("20,20,20", "0,0,0");

      if (!isEmpty(desc))
        desc = textToHtml(desc);

      var event = "openTask('" + id + "','" + status + "','" + funcid + "','" + wtype + "')";

      //var bgcolor = j%2 == 0 ? "background-color:rgb(255,255,255);" : "background-color:rgb(236,236,236);";
      var bgcolor = "background-color:rgb(255,255,255);";


      var img = "";

      //优先级
      if (priority == "3" || priority == "4") {
        img = '<img src="desktop2.1/images/priority.png" style="width:12px;height:12px" align="absmiddle"></img>&nbsp;&nbsp;';
      }
      //消息
      if (wtype == 'N' || wtype == 'E') {
        img = '<img src="desktop2.1/images/notify.png" style="width:12px;height:12px" align="absmiddle"></img>&nbsp;&nbsp;';
      }
      //置顶
      if (toptask == "1") {
        img = '<img src="desktop2.1/images/top.png" style="width:12px;height:12px;color:RGB(247,150,6);" align="absmiddle"></img>&nbsp;&nbsp;';
      }

      if (!(priority == "3" || priority == "4") && _tasktype == "0" &&
        status == "1" && desc.indexOf("驳回") < 0) {

        if (taskNotifyType == "N")
          fontColor = "color:RGB(120,120,120);";
        else
          fontColor = "color:RGB(120,120,120);"; //fontColor = "color:RGB(80,80,80);";
      }

      var userimg = '<img src="desktop2.1/images/user.png" style="float: left;" ></img>';

      //是否需要快速提交按钮
      var btArr = [];
      if (canShowFlowInfoBT(wtype, sortmemo, comefromindex))
        btArr.push('<span class="quickbtn" onclick="viewStepInfo(\'' + id + '\')">流程</span>\n');

      if (_showquicksubmitbt == "true" && canbatch == "1") {
        btArr.push('<span class="quickbtn" style="color:RGB(185, 10, 10);" onclick="aggreeTask(\'' + id + '\',\'B\')" >驳回</span>\n');
        btArr.push('<span class="quickbtn" style="color:rgb(33, 109, 28);" onclick="aggreeTask(\'' + id + '\',\'S\')">同意</span>\n');
      }

      if (_tasktype == "1" && taskNotifyType != "N") {
        btArr.push('<span class="quickbtn" style="color:RGB(185, 10, 10);" onclick="sendPriorityNotify(\'' + id + '\')">催办</span>\n');
      }

      //通知
      if (taskNotifyType == "N") {
        __sendNotifyTitleObj[id] = desc;

        btArr.push('<span class="quickbtn" style="color:rgb(33, 109, 28);" onclick="sendNotify(\'' + id + '\')">通知</span>\n');
        btArr.push('<span class="quickbtn" style="color:RGB(185, 10, 10);" onclick="compleatNotify(\'' + id + '\')">删除</span>\n');
      }

      htmlArr.push('<md-list-item id="' + id + '" title_id="' + titleid + '" class="md-3-line md-no-proxy _md" role="listitem" style="height:70px;min-height:70px;padding-right:5px;' + bgcolor + '">\n');
      htmlArr.push('	<div class="md-list-item-text" style="padding-left: 13px;">\n');
      htmlArr.push('		<h3 id="desc_' + id + '" class="msg-content" style="font-size:14px;float: none;cursor:pointer;margin: 10px 0px 0px 0px;' + fontColor + '" onclick="' + event + '">' + img + desc + '</h3>\n');
      htmlArr.push('		<p class="date" md-colors="::{color: \'default-accent\'}" style="font-size:12px;color: rgb(48, 157, 204);width:300px">' + date + '</p>\n');
      htmlArr.push('		<p class="person" md-colors="::{color: \'default-accent\'}"\n');
      htmlArr.push('			style="font-size:12px;color: rgb(160,160,160);">' + userimg + '&nbsp;' + username + '</p>\n');
      //htmlArr.push('		<span onclick="toTopTask(\''+id+'\')" class="quickbtn" style="margin-left:6px;margin-right:20px;color:RGB(247,150,6);">置顶</span>\n');
      htmlArr.push('		' + btArr.join("") + '\n');
      htmlArr.push('	</div>\n');
      htmlArr.push('	<!--<md-button class="md-secondary">Respond</md-button>-->\n');
      htmlArr.push('	<md-divider></md-divider>\n');
      htmlArr.push('	<div class="md-secondary-container"></div>\n');
      htmlArr.push('</md-list-item>\n');
    }

    htmlArr.push('</div>\n');
  }

  dataDiv.innerHTML = htmlArr.join("");
  showLoading("0", "");
}


function getTask_complete_lower(json, taskNotifyType) {

  var dataDiv = $("task_data_div");
  dataDiv.innerHTML = ""; //清空原来的数据，加载新的数据

  if (json.indexOf("error") >= 0) {
    var msg = json.substring("error:".length);
    showLoading("0", "");
    alert(msg);
    return;
  }

  if (isEmpty(json)) { //没有数据
    //清空记录数
    if (taskNotifyType == "N") //通知
      setCount("notifyCount", -1);
    else
      setCount("taskCount", -1);

    showLoading("0", "");
    return;
  }


  var jsonObj = eval('(' + json + ')');

  //加上任务的记录数
  var total = jsonObj["total"];
  if (taskNotifyType == "N") //通知
    setCount("notifyCount", total);
  else {
    if (_tasktype == "0")
      setCount("taskCount", total);
  }

  var htmlArr = [];

  var titleArr = jsonObj["titleinfo"];
  var dataObj = jsonObj["data"];

  for (var i = 0; i < titleArr.length; i++) {
    var titles = titleArr[i];
    var tid = titles[0];
    var title = titles[1];
    var size = titles[2];

    var dblclickEvt = "";
    if (_grouptype == "T") //按业务才需要
      dblclickEvt = ' ondblclick="autoSubmit(\'' + title + '\')" ';

    //分类头
    htmlArr.push('<div class="title" id="' + tid + '" onclick="expandTask(\'' + tid + '\')" ' + dblclickEvt + ' style="cursor:pointer;">\n');
    htmlArr.push('	' + title + ' （<span id="num_sp_' + tid + '">' + size + '</span>条 ）\n');
    htmlArr.push('</div>\n');

    var groupDisplay = "";
    if (taskNotifyType == "N" && i < titleArr.length - 1) {
      groupDisplay = "display:none;";
    }

    htmlArr.push('<div id="taskgroup_' + tid + '" class="list-group" style="' + groupDisplay + '">\n'); //用来进行折叠的div

    //数据
    var datas = dataObj[tid];
    for (var j = 0; j < datas.length; j++) {
      var obj = datas[j];
      var id = obj[0];
      var titleid = obj[1];
      var desc = obj[2];
      var date = obj[3];
      var username = obj[4];
      var status = obj[5];
      var sortmemo = obj[6];
      var priority = obj[7];
      var funcid = obj[8];
      var wtype = obj[9];
      var toptask = obj[10];
      var canbatch = obj[11];
      var fontColor = obj[12];
      var comefromindex = obj[13];

      fontColor = (fontColor + "").replace("20,20,20", "0,0,0");

      if (!isEmpty(desc))
        desc = textToHtml(desc);

      var event = "openTask('" + id + "','" + status + "','" + funcid + "','" + wtype + "')";

      //var bgcolor = j%2 == 0 ? "background-color:rgb(255,255,255);" : "background-color:rgb(236,236,236);";
      var bgcolor = "background-color:rgb(255,255,255);";

      var img = "";

      //优先级
      if (priority == "3" || priority == "4") {
        img = '<img src="desktop2.1/images/priority.png" style="width:12px;height:12px" align="absmiddle"></img>&nbsp;';
      }
      //消息
      if (wtype == 'N' || wtype == 'E') {
        img = '<img src="desktop2.1/images/notify.png" style="width:12px;height:12px" align="absmiddle"></img>&nbsp;';
      }
      //置顶
      if (toptask == "1") {
        img = '<img src="desktop2.1/images/top.png" style="width:12px;height:12px;color:RGB(247,150,6);" align="absmiddle"></img>&nbsp;';
      }

      //是否需要快速提交按钮
      var btArr = [];
      if (canShowFlowInfoBT(wtype, sortmemo, comefromindex))
        btArr.push('<span class="quickbt" onclick="viewStepInfo(\'' + id + '\')">流程</span>\n');
      if (_showquicksubmitbt == "true" && canbatch == "1") {
        btArr.push('<span class="quickbt" style="color:RGB(185, 10, 10);" onclick="aggreeTask(\'' + id + '\',\'B\')">驳回</span>\n');
        btArr.push('<span class="quickbt" style="color:rgb(33, 109, 28);" onclick="aggreeTask(\'' + id + '\',\'S\')">同意</span>\n');
      }

      if (_tasktype == "1" && taskNotifyType != "N") {
        btArr.push('<span class="quickbt" style="color:RGB(185, 10, 10);" onclick="sendPriorityNotify(\'' + id + '\')">催办</span>\n');
      }

      //通知
      if (taskNotifyType == "N") {
        __sendNotifyTitleObj[id] = desc;

        btArr.push('<span class="quickbt" style="color:rgb(33, 109, 28);" onclick="sendNotify(\'' + id + '\')">通知</span>\n');
        btArr.push('<span class="quickbt" style="color:RGB(185, 10, 10);" onclick="compleatNotify(\'' + id + '\')">删除</span>\n');
      }

      if (!(priority == "3" || priority == "4") && _tasktype == "0" &&
        status == "1" && desc.indexOf("驳回") < 0) {
        if (taskNotifyType == "N")
          fontColor = "color:RGB(120,120,120);";
        else
          fontColor = "color:RGB(120,120,120);"; //fontColor = "color:RGB(80,80,80);";
      }

      htmlArr.push('<div id="' + id + '" title_id="' + titleid + '">\n');
      htmlArr.push('    <h3 id="desc_' + id + '" style="' + fontColor + '" onclick="' + event + '">' + img + desc + '</h3>\n');
      htmlArr.push('    <p >\n');
      htmlArr.push('        <span class="date" style="font-size:12px;color: rgb(48, 157, 204);width:300px">' + date + '</span>\n');
      htmlArr.push('        <span class="person right" style="font-size:12px;color: rgb(160,160,160);">&nbsp;' + username + '</span>');
      htmlArr.push('<img src="desktop2.1/images/user.png" style="" class="right"></img>\n');
      //htmlArr.push('<span onclick="toTopTask(\''+id+'\')" class="quickbt" style="margin-left:6px;margin-right:20px;color:RGB(247,150,6)">置顶</span>\n');
      htmlArr.push(btArr.join("") + "\n");
      htmlArr.push('    </p>\n');
      htmlArr.push('</div>\n');

    }

    htmlArr.push('</div>\n');
  }

  dataDiv.innerHTML = htmlArr.join("");
  showLoading("0", "");
}

function getNotify(allnotify, filter) {

  filter = $("searchTX").value;

  filter = isEmpty(filter) ? "" : filter;

  var ckObj = $("notifyTypeCk");
  allnotify = "1"; //全部
  if (ckObj.checked) {
    allnotify = "0";
  } else {
    allnotify = "1";
  }

  showLoading("1", "通知消息加载中,请稍候...");

  //var json = "";

  var url1 = "loadMain.do";
  var myAjax = new Ajax.Request(
    url1, {
      method: 'post',
      parameters: "action=loadTaskByAjax&taskType=0&taskGpType=D&getnoftify=1&allnotify=" + allnotify + "&filter=" + encodeURIComponent(filter),
      onSuccess: function(request) {
        getTask_complete(request.responseText, "N");
      },
      onFailure: function(request) {
        getTask_complete("error:取通知失败！");
      }
    }
  );
}

function getNotifyCount() {
  var ckObj = $("notifyTypeCk");
  var allnotify = "1"; //全部
  if (ckObj.checked) {
    allnotify = "0";
  } else {
    allnotify = "1";
  }

  //TODO
  // var url1 = "loadMain.do?action=getNotifyCountByAjax&taskType=0&taskGpType=D&getnoftify=1&allnotify=" + allnotify;
  // $.get(url1, function(response) {
  //   setCount("notifyCount", request.responseText);
  // }).fail(function() {
  //   setCount("notifyCount", "");
  // });
   setCount("notifyCount", 20);
}

function setCount(name, countS) {
  var ct = parseInt(countS + "", 10);
  var $dom = $('#' + name);
  if (!isNaN(ct) && ct > 0) {
    $dom.show();
    $dom.text(ct);
  } else {
    $dom.hide();
    $dom.empty();
  }

}

function openTask(id, st, fid, wtype) {
  _selTaskId = id;
  var url = "flow.do?taskID=" + id + "&taskStatus=" + st + "&taskType=" + _tasktype + "&tfuncid=" + fid + "&wtype=" + wtype + "&action=load";

  var taskid = url.substring(url.indexOf("?taskID=") + 8);
  taskid = taskid.substring(0, taskid.indexOf("&"));
  var taskt = url.substring(url.indexOf("&taskType=") + 10);
  taskt = taskt.substring(0, taskt.indexOf("&"));
  var size = null;
  try {
    size = getStyleWidthHeight("", taskid, taskt, "");
  } catch (er) {}
  if (size != null) url += "&rs=0&mt=0"; //已经调整了，不在需要调整大小
  else size = "width=780,height=550,left=0,top=0,";


  //取出宽度和高度，然后调整为居中
  var wVal = size.substring(size.indexOf("width=") + 6, size.indexOf(",height="));
  var hVal = size.substring(size.indexOf("height=") + 7, size.indexOf(",left="));

  var leftVa = 0;
  var topVa = 0;
  try {
    leftVa = (window.screen.width - parseInt(wVal, 10)) / 2;
    topVa = (window.screen.height - parseInt(hVal, 10)) / 2;

    if (leftVa < 0) {
      leftVa = 0
    }

    if (topVa < 0) {
      topVa = 0
    }
  } catch (e) {}
  size = "width=" + wVal + ",height=" + hVal + ",left=" + leftVa + ",top=" + topVa + ",";

  //弹出窗体并告诉工作流不需要弹出窗口
  var currentUserId = "";
  try {
    currentUserId = getCurrentUserId();
  } catch (eee) {}
  var wino = window.open(url + "&openWin=F", taskid + currentUserId, size + "toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no");
  try {
    setOpenWinObj(wino);
  } catch (ere) {}

  //设置任务为已读的颜色
  try {
    var obj = $("desc_" + _selTaskId);
    obj.style.color = "rgb(120,120,120)";
  } catch (eee) {}

  //修改未读消息数并删除所选消息
  if (wtype == "N") {
    var ckObj = $("notifyTypeCk");
    if (ckObj.checked) {
      delTaskTrRow();
    }
  }

  return false;
}

function expandTask(tid) {
  var obj = $("taskgroup_" + tid);
  obj.style.display = (obj.style.display == "none") ? "" : "none";
}

function delTaskTrRow() {
  if (isEmpty(_selTaskId))
    return;

  var obj = $(_selTaskId);

  //取出tid
  var tid = obj.getAttribute("title_id");

  //修改任务记录数
  try {
    var num = parseInt($("num_sp_" + tid).innerHTML, 10) - 1;
    $("num_sp_" + tid).innerHTML = num + "";
  } catch (ee) {}

  //修改气泡的数量
  try {
    var name = "taskCount"; //任务
    if (_taskNotifyType == "N") { //通知
      name = "notifyCount";
    }
    var ct = parseInt($(name).innerHTML, 10);

    if (!isNaN(ct))
      ct = ct - 1;

    setCount(name, ct + "");
  } catch (ee) {}

  obj.parentNode.removeChild(obj);
}

function changeTaskGroupByCk(ckObj) {
  if (ckObj.checked) {
    getTask(_tasktype, 'T');
  } else {
    getTask(_tasktype, 'D');
  }
}

function showReadedNotify(ckObj) {
  //	var allnotify = "1";//全部
  //	if(ckObj.checked){
  //		allnotify = "0";
  //	}else{
  //		allnotify = "1";
  //	}
  getNotify();
}

//取出打开样式的长宽高
function getStyleWidthHeight(flowcode, taskid, taskType, wpid, customid) {
  if (customid == undefined)
    customid = "";
  var reStr = null;
  $.ajax({
    url: "flow.do?action=getStyleInfo&flowcode=" + flowcode + "&taskid=" + taskid + "&taskType=" + taskType + "&workpubid=" + wpid + "&customid=" + customid,
    async: false,
    success: function(response) {
      //取当前日期
      var text = response.responseText;
      if (text != null && text != "") reStr = text;
    }
  });
  return reStr;
}

function aggreeTask(taskid, type) {
  dealAgreeTask(taskid, type);

}

function dealAgreeTask(taskid, type) {
  _selTaskId = taskid;

  var reStr = null;

  var url = "flow.do";
  var myAjax = new Ajax.Request(
    url, {
      method: 'post',
      parameters: "action=aggreeTaskAjax&taskid=" + taskid + "&type=" + type,
      asynchronous: false,
      onSuccess: function(request) {
        var text = request.responseText;
        reStr = text;
      },
      onFailure: function(request) {
        reStr = "取任务信息失败！";
        return;
      }
    }
  );

  if (reStr.indexOf("失败") > 0) {
    alert(reStr);
    return;
  }
  var obj = null;
  eval(reStr);

  if (obj != null) {
    var re = quickSubmit(taskid, type, obj["billid"], "", obj["useraccessid"]);
    if (re == true) {
      try {
        delTaskTrRow();
      } catch (err) {
        debugger;
      }
    }
  }

}

function viewStepInfo(taskid) {
  var url = "system/form2/jsp/formData.do?action=viewflowinfo&type=0&taskid=" + taskid + "&taskType=" + _tasktype + "";
  var wino = window.open(url, "_blank", "width=" + (screen.availWidth - 8) + ",height=" + (screen.availHeight - 34) + ",toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no,left=0,top=0");
  try {
    window.parent.frameElement.contentWindow.parent.setOpenWinObj(wino);
  } catch (ere) {}
}

function sendPriorityNotify(taskid) {
  var url = "system/flow/search/jsp/queryFlowRun.do";
  var rexml = "";
  var myAjax = new Ajax.Request(
    url, {
      method: 'post',
      parameters: "action=checkCanSendPriorityNotify&taskid=" + taskid,
      asynchronous: false,
      onSuccess: function(request) {
        rexml = request.responseText;
      },
      onFailure: function(request) {
        rexml = "失败！";
      }
    }
  );

  if ("true" != trim(rexml)) {
    alert(rexml);
    return;
  }

  var retValue = window.showModalDialog(url + '?action=quickSendNotify&taskid=' + taskid, window, 'dialogHeight:320px; dialogWidth:540px; center: yes; help: no;');

}

function compleatNotify(taskid) {

  _selTaskId = taskid;

  var url = "system/flow/modules/jsp/notifyMD.do";
  var isok = true;
  var myAjax = new Ajax.Request(
    url, {
      method: 'post',
      parameters: "action=complete&taskID=" + taskid,
      asynchronous: false,
      onSuccess: function(request) {
        //取当前日期
        var text = request.responseText;
      },
      onFailure: function(request) {
        return;
      }
    }
  );

  if (isok) {
    delTaskTrRow();
  }

}

var __sendNotifyTitleObj = {};

function sendNotify(taskid, obj) {

  _selTaskId = taskid;

  //取标题

  var title = __sendNotifyTitleObj[taskid];
  if (isEmpty(title)) {
    title = "通知消息内容";
  }

  var obj = {
    "title": title
  };

  var reStr = window.showModalDialog('system/flow/modules/jsp/notify/resetTitle.jsp', obj, 'dialogHeight:285px; dialogWidth:545px;center:yes;scrollbars=yes;resizable=yes;help=no;status=no;');
  if (reStr == undefined) {
    return;
  } else {
    var tt = reStr["title"];
    __sendNotifyTitleObj[taskid] = tt;
    title = tt;
    var reSts = reStr["re"];
    if (reSts == "0")
      return;
  }

  //计算窗口的打开位置为居中
  var width = 800;
  var height = 600;
  //不需要全屏
  //    try{
  //		width = window.screen.width;
  //		height = (window.screen.height)-20;
  //    }catch(e){
  //    }

  var reStr = window.showModalDialog('system/formpubmodule/jsp/formModuleSelUser.do?action=main', "选择通知人", 'dialogTop:0px;dialogLeft:0px;dialogHeight:' + height + 'px; dialogWidth:' + width + 'px;center:yes;scrollbars=yes;resizable=yes;help=no;status=no;');
  if (!reStr) {
    return;
  }

  var arr = reStr.split('\n');
  var sendMsg = "";
  if (arr.length > 1) {
    for (var i = 1; i < arr.length; i++) {
      var vals = arr[i].split('\t');
      sendMsg += "<user><id>" + vals[0] + "</id></user>";
    }
  }

  //使用ajax发送消息
  var msg = "发送失败！";
  var myAjax = new Ajax.Request(
    "system/flow/modules/jsp/notifyMD.do", {
      method: 'post',
      parameters: "action=send&taskID=" + taskid + "&seluser=" + sendMsg + "&title=" + encodeURIComponent(title),
      asynchronous: false,
      onSuccess: function(request) {
        //取当前日期
        msg = request.responseText;
      },
      onFailure: function(request) {
        alert(msg);
        return false;
      }
    }
  );
  alert(msg);
}

function changeWork(type) {
  var taskDiv = $("mywork_div");
  var ywtreeDiv = $("mytree_div");

  var mytaskBt = $("mytaskBt");
  var myworkBt = $("myworkBt");

  var mdripplecontainer1 = $("md-ripple-container1");
  var mdripplecontainer2 = $("md-ripple-container2");

  var mdnavinkbar = $("md-nav-ink-bar");

  var height = taskDiv.offsetHeight - 2;

  if (type == "task") { //转到我的任务
    ywtreeDiv.style.display = "none";
    taskDiv.style.display = "";

    mdripplecontainer1.style.display = "";
    mdripplecontainer2.style.display = "none";

    mdnavinkbar.style.left = "6px";

    mytaskBt.className = "_md-nav-button md-accent md-button ng-scope md-ink-ripple md-active md-primary";
    myworkBt.className = "_md-nav-button md-accent md-button ng-scope md-ink-ripple md-unselected";

  } else { //转到我的工作
    taskDiv.style.display = "none";
    ywtreeDiv.style.display = "";

    mdripplecontainer1.style.display = "none";
    mdripplecontainer2.style.display = "";

    mdnavinkbar.style.left = "126px";

    mytaskBt.className = "_md-nav-button md-accent md-button ng-scope md-ink-ripple md-unselected";
    myworkBt.className = "_md-nav-button md-accent md-button ng-scope md-ink-ripple md-active md-primary";

    var frame = $("mytree_frame");
    //		if(!isInitTree)
    //			frame.src = "desktop2.1/jsp/mywork.jsp";

    isInitTree = true;

    //调整iframe高度
    ywtreeDiv.style.height = (height + 2) + "px";
    ywtreeDiv.style.overFlow = "hidden";
    frame.style.height = height + "px";
  }
}

function changeTaskGroup(type) {

  var timeGroupBt = $("timeGroupBt");
  var workGroupBt = $("workGroupBt");

  var mdripplecontainer1 = $("md-ripple-container_g1");
  var mdripplecontainer2 = $("md-ripple-container_g2");

  var mdnavinkbar = $("md-nav-ink-bar2");

  if (type == "T") { //通知

    _taskNotifyType = "N";

    $("taskGroupCkDiv").style.display = "none";
    $("yworderDIV").style.display = "none";
    $("notifyCkDiv").style.display = "";

    mdripplecontainer1.style.display = "none";
    mdripplecontainer2.style.display = "";

    mdnavinkbar.style.left = "108px";

    if (isLower) {
      $("workGroupSP").style.color = "rgb(10, 150, 210)";
      $("timeGroupSP").style.color = "rgb(117,117,117)";


      if (navigator.userAgent.indexOf("MSIE 8") > 0) {
        $("taskCount").style.left = "83px";
        $("notifyCount").style.left = "85px";
      } else {
        $("taskCount").style.left = "68px";
        $("notifyCount").style.left = "76px";
      }
    }

  } else { //任务分类
    if (_grouptype == "T")
      $("yworderDIV").style.display = "";

    _taskNotifyType = "T";

    $("taskGroupCkDiv").style.display = "";
    $("notifyCkDiv").style.display = "none";

    mdripplecontainer1.style.display = "";
    mdripplecontainer2.style.display = "none";

    mdnavinkbar.style.left = "12px";

    timeGroupBt.className = "_md-nav-button md-accent md-button ng-scope md-ink-ripple md-active md-primary";
    workGroupBt.className = "_md-nav-button md-accent md-button ng-scope md-ink-ripple md-unselected";

    if (isLower) {
      $("workGroupSP").style.color = "rgb(117,117,117)";
      $("timeGroupSP").style.color = "rgb(10, 150, 210)";

      if (navigator.userAgent.indexOf("MSIE 8") > 0) {
        $("taskCount").style.left = "83px";
        $("notifyCount").style.left = "85px";
      } else {
        $("taskCount").style.left = "75px";
        $("notifyCount").style.left = "70px";
      }
    }
  }
}

/**
 * 批量审批
 * @param sortmemo
 */
function autoSubmit(sortmemo) {
  //先不用配置参数
  //	if(_needautosubmit != "true"){
  //		return;
  //	}

  if (sortmemo == "今天" || sortmemo == "昨天" || sortmemo == "本周" || sortmemo == "之前") {
    return;
  }

  //计算窗口的打开位置为居中
  var top = (768 - 640) / 2;
  var left = (1024 - 1024) / 2;
  try {
    left = (window.screen.width - 1024) / 2;
    top = (window.screen.height - 640) / 2;
  } catch (e) {}
  var url = "system/flowautosubmit/jsp/flowAutoSubmit.do?action=main&userID=" + getCurrentUserId() + "&sortmemo=" + encodeURIComponent(encodeURIComponent(sortmemo));
  window.open(url, "", "width=1024,height=640,toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no,left=" + left + ",top=" + top);
}

function canShowFlowInfoBT(type, sortmemo, comefromindex) {
  if ("M" == (type)) {
    return false;
  } else if ("N" == (type) && "催办任务" == (sortmemo)) {
    return true;
  } else if ("N" == (type) && isEmpty(comefromindex)) {
    return false;
  } else if ("N" == (type) && "#" == (comefromindex)) {
    return false;
  } else if ("N" == (type) && "#1" == (comefromindex)) {
    return false;
  } else if ("N" == (type) && !isEmpty(comefromindex) && comefromindex.length == 32) {
    return true;
  } else {
    return true;
  }
}

function setTaskGroupTypeToCookice() {
  var expires = new Date();
  expires.setTime(expires.getTime() + (3 * 30 * 24 * 60 * 60 * 1000));
  document.cookie = "TGP2=" + _grouptype + "; expires=" + expires.toGMTString();
}

function getTaskGroupTypeFromCookice() {
  var cookieString = document.cookie;

  var cookieName = "TGP2=";
  var start = cookieString.indexOf(cookieName);
  // 加上等号的原因是避免在某些 Cookie 的值里有
  // 与 cookieName 一样的字符串。
  if (start > -1) { //找到就赋上值
    var cookiesVal = "";
    start += cookieName.length;
    var end = cookieString.indexOf(';', start);
    if (end > -1)
      cookiesVal = cookieString.substring(start, end);
    else
      cookiesVal = cookieString.substring(start);
    return cookiesVal;
  }
  return null;
}

function initTaskGroupType() {
  _grouptype = getTaskGroupTypeFromCookice(); //初始化业务分类类型
  if (_grouptype == null)
    _grouptype = "D";

  if (_grouptype == "T")
    $("ywGpCk").checked = true;

}
