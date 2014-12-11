var INDEX;
var CLASS;

var URL_INDEX    = 'store/index.json';
var URL_CLASS    = 'store/class.json';
var URL_PREFIX   = 'store/';
var CHAPTER_URL;

var DIV_LISTPOST;
var DIV_HEADER;
var DIV_CLASS;
var DIV_CHAPTER;
var DIV_INDEX;
var DIV_EDIT;

var BUTTON_GVIM;   // 打开GVIM 进行编辑
var BUTTON_OPTION; // 用户打开弹出层进行信息修改

var CHAPTER_ID;
function DataInit()//从服务器得到数据信息
{
    if (window.location.host == 'localhost')
    {
        URL_INDEX = URL_INDEX + "?st=" + new Date().getTime();
        URL_CLASS = URL_CLASS + "?st=" + new Date().getTime();
    }
    $.ajax({  
          url : URL_INDEX,  
          async : false,  
          success : function(index){ 
              //index = $.parseJSON(indxe); 
              index = index.reverse();
              INDEX = [];
              var i;
              for (i in index)
              {
                  var t = [];
                  t.id    = index[i][0];
                  t.title = index[i][1];
                  t.tags  = index[i][2];
                  t.ctime = index[i][3];
                  t.mtime = index[i][4];
                  INDEX.push(t);
              }
          },
    });
    $.ajax({
        url: URL_CLASS, 
        async : false,  
        success: function(cls){ 
            CLASS = cls; 
            DIV_CLASS.append($('<div>').text('全部'));
            for (var c in CLASS)
            {
                DIV_CLASS.append($('<div>').text(c));

            }
        }
    });
}

function GetInfo(ID)
{
    for (var i in INDEX)
    {
        if (INDEX[i].id == ID)
        {
            return INDEX[i];
        }
    }
}
function GetClass(ID)
{
    ID = ID * 1;
    for (var c in CLASS)
    {
        if ($.inArray(ID, CLASS[c]) > -1)
        {
            return c;
        }
    }
}

function ShowListPost()// 显示list post
{
    DIV_LISTPOST.show();

    DIV_CHAPTER.hide();
    DIV_INDEX.hide();
    DIV_EDIT.hide();

    var filter = false;// 可能带有参数, 指定要显示的IDs
    if (arguments.length > 0) filter = arguments[0];

    DIV_LISTPOST.html('');
    for (var i in INDEX)
    {
        if (filter && jQuery.inArray(INDEX[i].id, filter) == -1)
                continue;
        DIV_LISTPOST.append($('<button>').val(INDEX[i].id).text(INDEX[i].title));
    }
    $( document ).scrollTop( 0 /*DIV_LISTPOST.offset( ).top*/ );
}

function ClassShowListPost()// 通过类显示list post
{
    // 得到指定的类的id 的list
    var f = CLASS[$(this).text()];
    ShowListPost(f);
}
function EShowChapter()// 用于事件回调
{
    var ID = $(this).attr('value');
    ShowChapter(ID);
}

function ShowChapter(ID)
{
    var info = GetInfo(ID);
    DIV_LISTPOST.hide();
    var content = DIV_CHAPTER.find('#content');
    var cls     = DIV_CHAPTER.find('#class');
    var tag     = DIV_CHAPTER.find('#tag');
    var time    = DIV_CHAPTER.find('#time');
    var title   = DIV_CHAPTER.find('#ctitle');

    content.html('...');

    var date = new Date(info.mtime * 1000);
    Y = date.getFullYear() + '-';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    D = date.getDate() + ' ';
    h = date.getHours() + ':';
    m = date.getMinutes() + ':';
    s = date.getSeconds();
    time.text(Y+M+D+h+m+s);
    cls.text(GetClass(ID));

    if (info.tag)
    {
        tag.text(', ' + info.tag);
    }

    DIV_CHAPTER.show();
    EditShow();

    var p = location.pathname + '?id=' + ID;
    title.html($('<a>').text(info.title).attr('href', p));

    CHAPTER_ID = ID;

    CHAPTER_URL = URL_PREFIX + ID;

    var url = CHAPTER_URL + '/index.html';

    $.get(url, function(data){
        content.html(data);
        index_init(DIV_INDEX, content);
    });
}

function EditWithGvim()
{
    $.post('/normal/gvim', {'arg': 'WikiGet ' + CHAPTER_ID}, 
        function(){alert('OK');});
}

function EditShow()
{
    DIV_EDIT = $("#edit");
    if (window.location.host != 'localhost')
    {
        DIV_EDIT.hide();
        return;
    }
    DIV_EDIT.show();
}

function getUrlParams() {  
    var result = {};  
    var params = (window.location.search.split('?')[1] || '').split('&');  
    for(var param in params) {  
        if (params.hasOwnProperty(param)) {  
            paramParts = params[param].split('=');  
            result[paramParts[0]] = decodeURIComponent(paramParts[1] || "");  
        }  
    }  
    return result;  
}
$(document).ready(function(){
    DIV_LISTPOST = $('div#listpost');
    DIV_HEADER   = $('div#header');
    DIV_CLASS    = $('div#class_div');
    DIV_CHAPTER  = $('div#chapter');
    DIV_INDEX    = $('div#index');



    DIV_LISTPOST.on('click', 'button', EShowChapter);
    DIV_CLASS.on('click', 'div', ClassShowListPost);

    EditShow();
    OptionInit();

    var path = window.location.pathname;
    if (path[path.length - 1] != '/')
    {
        var t = path.split('/');
        t = t.slice(0, t.length - 1);
        path = t.join('/') + '/';
    }

    URL_PREFIX = path + URL_PREFIX;
    URL_INDEX  = path + URL_INDEX;
    URL_CLASS  = path + URL_CLASS;

    DataInit();
    var ID=getUrlParams().id;
    if (ID){
        ShowChapter(ID);
    }
    else{
        ShowListPost();
    }
});



