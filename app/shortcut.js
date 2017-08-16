/**
 * 取系统功能和快捷功能
 */
function initShortcut() {
  //TODO
  // var url1 = "shortcut.do?action=getSystemAndShortcutData";
  var url1 = 'datas/shortcut'
  $.get(url1, function(response) {
    getShortcutCallback_lower(response);
  });
}

function getShortcutCallback_lower(rexml) {
  var ulObj = $("#shortcutUL");
  ulObj.innerHTML = "";
  if (rexml && rexml.indexOf("失败") < 0) {
    var insertArr = [];

    var dataArrs = rexml.split("\n");

    for (var i = 0; i < dataArrs.length; i++) {

      var dataArr = dataArrs[i].split("\t", -1);

      var id = dataArr[0];
      var name = dataArr[1];
      var funcid = dataArr[2];
      var funcXH = dataArr[3];
      var funcType = dataArr[4];

      if (funcXH && funcXH.length <= 2) { // 序号大于2的都是功能
        continue;
      }

      var event = "openFlowUrl('" + funcid + "');";

      var img = "<img src=\"app/images/biaodan.png\" align=\"absmiddle\" style=\"width:24px;height:24px;padding-right:1px;\"></img>";
      var iconColor = "rgb(0, 115, 156)"; //"rgb(128, 216, 255)";
      if (funcType == "Q") { //查询
        iconColor = "rgb(42, 180, 228)";
        img = "<img src=\"app/images/chaxun.png\" align=\"absmiddle\" style=\"width:24px;height:24px;padding-right:1px;\"></img>";
      }

      insertArr.push('<li>\n');
      insertArr.push('	<a href="javascript:' + event + '">\n');
      insertArr.push('	' + img + '');
      insertArr.push(name + '\n');
      insertArr.push('	</a>\n');
      insertArr.push('</li>\n');

    }
    ulObj.html(insertArr.join(""));

  }

  if (rexml.indexOf("失败") >= 0) {
    alert(rexml);
  }
}

function openFlowUrl(funcid) {
  var url = "";

  var url1 = "shortcut.do";
  var myAjax = new Ajax.Request(url1, {
    method: 'post',
    parameters: "action=getFuncInfoStr&funcid=" + funcid,
    asynchronous: false,
    onSuccess: function(request) {
      url = request.responseText;
    },
    onFailure: function(request) {
      //msg = ("获取当前任务失败！");
      return;
    }
  });

  if (url.indexOf("flow.do") < 0) {
    return;
  }

  var funcType = url.substring(url.indexOf("&funcType=") + 10);
  funcType = funcType.substring(0, funcType.indexOf("&"));

  var funcIdStr = url.substring(url.indexOf("&funcId=") + 8);
  funcIdStr = funcIdStr.substring(0, funcIdStr.indexOf("&"));

  //计算窗口的打开位置为居中
  var left = (1024 - 780) / 2;
  var top = (768 - 550) / 2;
  try {
    left = (window.screen.width - 780) / 2;
    top = (window.screen.height - 550) / 2;
  } catch (e) {}

  var size = "width=780,height=550,left=" + left + ",top=" + top + ",";
  if ("1" == funcType) {
    var code = url.substring(url.indexOf("&flowClassID=") + 13);
    code = code.substring(0, code.indexOf("&"));
    size = getStyleWidthHeight(code, "", "", "");
    if (size != null)
      url += "&rs=0&mt=0"; //已经调整了，不在需要调整大小
    else
      size = "width=780,height=550,left=0,top=0,"

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

  } else if ("2" == funcType) {
    var fid = url.substring(url.indexOf("&flowClassID=") + 13);
    fid = fid.substring(0, fid.indexOf("&"));
    if (fid == "00004501") {
      var wpid = url.substring(url.indexOf("moduleid%3D") + 11, url.indexOf("moduleid%3D") + 11 + 32);
      size = getStyleWidthHeight("", "", "", wpid);
      if (size != null)
        url += "&rs=0&mt=0"; //已经调整了，不在需要调整大小
      else
        size = "width=780,height=550,left=0,top=0,";

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
    } else if (fid == "40029002") { //自定义查询2.0
      var wpid = url.substring(url.indexOf("resultStyleID%3D") + 16, url.indexOf("resultStyleID%3D") + 16 + 32);
      size = getStyleWidthHeight("", "", "", "", wpid);
      if (size != null) url += "&rs=0&mt=0"; //已经调整了，不在需要调整大小
      else size = "width=780,height=550,left=0,top=0,";

      //取出宽度和高度，然后调整为居中
      var wVal = size.substring(size.indexOf("width=") + 6, size.indexOf(",height="));
      var hVal = size.substring(size.indexOf("height=") + 7, size.indexOf(",left="));

      //取出整个屏幕的尺寸，如果超过1280按百分比显示
      var swd = screen.availWidth;
      var sht = screen.availHeight;
      if (swd > 1280) {
        wVal = swd * 0.9;
        hVal = sht * 0.8;
      }

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
    }
  }
  var wino = window.open(url + "&openWin=T", funcIdStr, size + "toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no");
  wino.focus();
  wino.focus();
  setOpenWinObj(wino);

}

function setShortcutFunc() {

  var wVal = 845;
  var hVal = 692;
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
  var size = "width=" + wVal + ",height=" + hVal + ",left=" + leftVa + ",top=" + topVa + "";

  window.open("setShortcut/dist/index.html", null, size + ",toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no");
  // window.open("shortcut.do?action=setShortcut",null,size+ ",toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no");

}
