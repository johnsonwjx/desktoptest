var treeSuggestion = function() {
  var treeLeaf = new Array();
  var treeLeafText = new Array();

  return {

    init: function(codeArr, textArr) {
      treeLeaf = codeArr,
        treeLeafText = textArr;
    },

    find: function(text) {
      var result = new Array();
      for (var i = 0; i < treeLeafText.length; i++) {
        if (treeLeafText[i].indexOf(text) > -1) {
          result.push({
            index: i,
            text: treeLeafText[i]
          });
        }
      }
      return result;
    },

    get: function(i) {
      return treeLeaf[i];
    }
  };
}();

function resetSuggestion() {
  document.getElementById('queryFuncInput').value = '';
  document.getElementById('queryFuncSuggestDiv').innerHTML = '';
  document.getElementById('queryFuncSuggestDiv').style.visibility = 'hidden';

  document.getElementById('queryFuncBanner').style.visibility = 'hidden';

}

function resetSuggestionPosition() {
  var $tree = document.getElementById('tree');
  //var isScroll = $tree.scrollHeight > $tree.offsetHeight;
  var isScroll = false;

  var $queryFuncIcon = document.getElementById('queryFuncIconDiv');
  var $queryFuncBanner = document.getElementById('queryFuncBanner');
  if (isScroll) {
    $queryFuncIcon.style.right = '54px';

    $queryFuncBanner.style.width = '242px';

  } else {
    $queryFuncIcon.style.right = '54px';

    $queryFuncBanner.style.width = '242px';
  }
}

var lastSearchQuery = '';
var child = new Array();
var currentIndex = 0;
var currentSuggestionList = [];

function selectASuggestion() {

  var index = currentSuggestionList[currentIndex].index;
  var code = treeSuggestion.get(index);

  //查找有没有上级
  var start = 0;
  var end = 2;
  while (code.length - 2 >= end) {

    var parentCode = code.substring(start, end);

    if (document.getElementById(parentCode + "_a") != undefined && document.getElementById(parentCode + "_a") != null)
      expanded(document.getElementById(parentCode + "_a"));

    end += 2;
  }

  //document.getElementById(code+"_a").click();

  window.setTimeout("onTimeoutFocus(\"" + code + "_a" + "\")", 10);

  resetSuggestion();
}

function createSuggestion(codeArr, textArr) {
  resetSuggestionPosition();
  treeSuggestion.init(codeArr, textArr);
  var $queryFuncIcon = $('#queryFuncIconDiv')
  $queryFuncIcon.click(function() {
    document.getElementById('queryFuncBanner').style.visibility = 'visible';
    document.getElementById('queryFuncInput').focus();
  });
  $(document).on('mouseup', function(event) {

    var $target = event.target || event.srcElement;
    if ($target.id === 'queryFuncInput' || $target.id === 'queryFuncIconDiv' || $target.className === 'queryFuncSuggestItemLink') {
      if (event.stopPropagation) {
        event.stopPropagation();
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
      return;
    }
    resetSuggestionPosition();
    resetSuggestion();
  })
  $(document).on('keyup', function(event) {
    var $target = event.target || event.srcElement;
    if ($target.id !== 'queryFuncInput') {
      return;
    }
    var key = event.which || event.keyCode;
    if (key === 13 || key === 16) {
      // enter key
      selectASuggestion();
      return;
    }
    if (key === 37 || key === 39) {
      // left right key

      return;
    }
    if (key === 38) {
      // up key
      if (child.length === 0) return;
      child[currentIndex].className = 'queryFuncSuggestItem';
      currentIndex--;
      if (currentIndex === -1) currentIndex = child.length - 1;
      child[currentIndex].className = 'queryFuncSuggestItemSelect';
    }
    if (key === 40) {
      // down key
      if (child.length === 0) return;
      child[currentIndex].className = 'queryFuncSuggestItem';
      currentIndex++;
      if (currentIndex === child.length) currentIndex = 0;
      child[currentIndex].className = 'queryFuncSuggestItemSelect';
    }
    var value = $target.getValue ? $target.getValue() : $target.value;
    if (lastSearchQuery === value) return;
    lastSearchQuery = value;
    document.getElementById('queryFuncSuggestDiv').innerHTML = '';
    if (value === '') return;
    child.splice(0, child.length);
    currentSuggestionList.splice(0, currentSuggestionList.length);
    currentSuggestionList = null;
    currentSuggestionList = treeSuggestion.find(value);
    for (var i = 0; i < currentSuggestionList.length; i++) {
      var text = currentSuggestionList[i].text;
      var index = currentSuggestionList[i].index;
      child.push(appendToQueryFuncSuggestDiv(i, text));
    }
    if (currentSuggestionList.length > 0) {
      document.getElementById('queryFuncSuggestDiv').style.visibility = 'visible';
      child[0].className = 'queryFuncSuggestItemSelect';
      currentIndex = 0;
    }
  });
  var appendToQueryFuncSuggestDiv = function(index, text) {
    var e = document.createElement('div');
    e.className = 'queryFuncSuggestItem';
    e.innerHTML = '<a class="queryFuncSuggestItemLink" href="javascript: void(0);" onclick="selectASuggestion(); return false;" >' + text + '</a>';
    var $e = Element.extend(e);
    $e.setAttribute('index', index);
    Event.observe($e, 'mouseover', function(event) {
      var index = $e.getAttribute('index');
      child[currentIndex].className = 'queryFuncSuggestItem';
      currentIndex = index;
      child[currentIndex].className = 'queryFuncSuggestItemSelect';
    });
    $('queryFuncSuggestDiv').appendChild($e);
    return $e;
  }

};

function onTimeoutFocus(id) {
  document.getElementById(id).focus();
  document.getElementById(id).scrollIntoView(true);
}
