(function($) {
  var funcCodeArr = [];
  var funcTextArr = [];
  // var url = '../../loadFunc.do?action=getFuncJsonBynewDesktop2';
  var url = '/datas/func.json';

  window.WorkObj = {
    getTree: function() {
      $('.yiji').html('&nbsp;&nbsp;业务正在加载...');
      $.getJSON(url, handleData);
    }
  };

  function handleData(result) {
    if (!result) {
      return;
    }
    var datas = result;
    var $_list = $('.yiji').empty();

    $.each(datas, function(i, data) {

      var id = data.id;
      var code = data.code;
      var name = data.name;
      var url = data.url;
      var parentcode = data.parentcode;

      if (url != "") { //非目录
        funcCodeArr.push(code);
        funcTextArr.push(name);
      }

      var folderImg = "<img class='topfolder' src='app/images/topfolder.png' align='absmiddle' />";

      if (parentcode == "") { //第一级
        var $i = $('<li>');
        $i.attr("id", code);

        var $a = $('<a>');
        $a.html(folderImg + name);
        $a.attr("id", code + "_a");
        $a.css("overflow", "hidden");

        if (url != "") { //非目录
          $a.on('click', function() { //加上打开事件
            window.openFlowUrl("../../" + url);
          });
          $a.css("margin-left", "5px");
          $a.css("font-weight", "100");
          $a.css("height", "32px");
          $a.css("line-height", "32px");
          $i.css("background-color", "#FFFFFF");
        }

        $i.append($a);
        $_list.append($i);

      } else { //其他级次
        var parentObj = $('#' + parentcode);
        if (parentObj == null || parentObj.length <= 0)
          return;

        folderImg = "";
        if (url == "")
          folderImg = "<img class='childfolder' src='app/images/childfolder.png' align='absmiddle' />";

        var $i = $('<li>');
        $i.attr("id", code);

        var $a = $('<a>');
        $a.html(folderImg + name);
        $a.attr("id", code + "_a");
        $a.css("overflow", "hidden");

        if (url != "") { //非目录
          $a.on('click', function() { //加上打开事件
            window.openFlowUrl("../../" + url);
          });
          $a.css("margin-left", "5px");
          $a.css("font-weight", "100");
          $a.css("height", "32px");
          $a.css("line-height", "32px");
          $i.css("background-color", "#FFFFFF");
        }
        $i.append($a);

        try {
          parentObj.children('a')[0].className = "inactive";
        } catch (eee) {}

        if (parentObj.children('ul') == null || parentObj.children('ul').length <= 0) { //如果没有ul需要加上
          var $ul = $('<ul>');
          parentObj.append($ul);
        }

        var $ul = parentObj.children('ul')

        $ul.append($i);
      }

    });

    window.initInactive();

    window.createSuggestion(funcCodeArr, funcTextArr);
  }

})(jQuery);

function initInactive() {

  jQuery('.inactive').click(function() {
    if (jQuery(this).siblings('ul').css('display') == 'none') {
      jQuery(this).parent('li').siblings('li').removeClass('inactives');
      jQuery(this).addClass('inactives');
      jQuery(this).siblings('ul').slideDown(100).children('li');

      //第一级菜单只能展开一级
      if (jQuery(this).parent('li').parent("ul") != null && jQuery(this).parent('li').parent("ul").length > 0 &&
        jQuery(this).parent('li').parent('ul')[0].className == "yiji") {

        //if(jQuery(this).parents('li').siblings('li').children('ul').css('display')=='block'){
        jQuery(this).parents('li').siblings('li').children('ul').parent('li').children('a').removeClass('inactives');
        jQuery(this).parents('li').siblings('li').children('ul').slideUp(100);

        //}
      }
    } else {
      //控制自身变成+号
      jQuery(this).removeClass('inactives');
      //控制自身菜单下子菜单隐藏
      jQuery(this).siblings('ul').slideUp(100);
      //控制自身子菜单变成+号
      jQuery(this).siblings('ul').children('li').children('ul').parent('li').children('a').addClass('inactives');
      //控制自身菜单下子菜单隐藏
      jQuery(this).siblings('ul').children('li').children('ul').slideUp(100);

      //控制同级菜单只保持一个是展开的（-号显示）
      jQuery(this).siblings('ul').children('li').children('a').removeClass('inactives');
    }
  })
}

function expanded(node) {

  if (!(jQuery(node).siblings('ul').css('display') == 'none')) {
    return;
  }

  //后展开
  jQuery(node).parent('li').siblings('li').removeClass('inactives');
  jQuery(node).addClass('inactives');
  jQuery(node).siblings('ul').slideDown(100).children('li');

  //第一级菜单只能展开一级
  if (jQuery(node).parent('li').parent("ul") != null && jQuery(node).parent('li').parent("ul").length > 0 &&
    jQuery(node).parent('li').parent('ul')[0].className == "yiji") {

    //if(jQuery(node).parents('li').siblings('li').children('ul').css('display')=='block'){
    jQuery(node).parents('li').siblings('li').children('ul').parent('li').children('a').removeClass('inactives');
    jQuery(node).parents('li').siblings('li').children('ul').slideUp(100);

    //}
  }

}

/**
 * 新窗口打开或者直接打开
 * @param url 路径后面的参数
 * @param openMode 打开方式，0 或1,表示页面打开模式是非打开新页面和打开新页面
 */
function openFlowUrl(url, openMode) {

  openMode = "1";

  //新窗口打开
  if (openMode == "1") {

    //计算窗口的打开位置为居中
    var left = (1024 - 780) / 2;
    var top = (768 - 550) / 2;
    try {
      left = (window.screen.width - 780) / 2;
      top = (window.screen.height - 550) / 2;
    } catch (e) {}
    //检查业务功能是不是工作流业务，如果是直接跳转
    //将&amp;换成&
    url = url.replace(/&amp;/gi, "&");
    var funcType = url.substring(url.indexOf("&funcType=") + 10);
    funcType = funcType.substring(0, funcType.indexOf("&"));

    var funcIdStr = url.substring(url.indexOf("&funcId=") + 8);
    funcIdStr = funcIdStr.substring(0, funcIdStr.indexOf("&"));

    var size = "width=780,height=550,left=" + left + ",top=" + top + ",";
    if ("1" == funcType) {
      var code = url.substring(url.indexOf("&flowClassID=") + 13);
      code = code.substring(0, code.indexOf("&"));
      size = getStyleWidthHeight(code, "", "", "");
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
    } else if ("2" == funcType) {
      var fid = url.substring(url.indexOf("&flowClassID=") + 13);
      fid = fid.substring(0, fid.indexOf("&"));
      if (fid == "00004501") {
        var wpid = url.substring(url.indexOf("moduleid%3D") + 11, url.indexOf("moduleid%3D") + 11 + 32);
        size = getStyleWidthHeight("", "", "", wpid);
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
      } else if (fid == "40029002") { //自定义查询2.0
        var wpid = url.substring(url.indexOf("resultStyleID%3D") + 16, url.indexOf("resultStyleID%3D") + 16 + 32);
        size = getStyleWidthHeight("", "", "", "", wpid);
        if (size != null) url += "&rs=0&mt=0"; //已经调整了，不在需要调整大小
        else size = "width=780,height=550,left=0,top=0,";

        //取出宽度和高度，然后调整为居中
        var wVal = size.substring(size.indexOf("width=") + 6, size.indexOf(",height="));
        var hVal = size.substring(size.indexOf("height=") + 7, size.indexOf(",left="));

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
    var currentUserId = ""; //window.parent.frameElement.contentWindow.parent.getCurrentUserId();
    var wino = window.open(url + "&openWin=T", funcIdStr + currentUserId, size + "toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no");
    wino.focus();
    wino.focus();
    try {
      window.parent.frameElement.contentWindow.parent.setOpenWinObj(wino);
    } catch (ee) {}
  }
  //直接打开
  else {
    //window.parent.document.getElementById("main").contentWindow.location.href = url;
    var title = treeNodeObj.text;
    //var workObj = window.parent.document.getElementById("work").contentWindow;
    var workObj = window.parent.document.getElementById("rightMainFrame").contentWindow;
    workObj.location.href = "loadFunc.do?action=workpanel&param=" + encodeURIComponent(url);
  }
}

//取出打开样式的长宽高
function getStyleWidthHeight(flowcode, taskid, taskType, wpid, customid) {
  if (customid == undefined)
    customid = "";
  var reStr = null;
  var url = "../../flow.do";

  jQuery.ajax({
    async: false, //使用同步的Ajax请求
    type: "POST",
    url: url,
    data: "action=getStyleInfo&flowcode=" + flowcode + "&taskid=" + taskid + "&taskType=" + taskType + "&workpubid=" + wpid + "&customid=" + customid,
    success: function(msg) {
      reStr = msg;
    }
  });
  return reStr;
}
