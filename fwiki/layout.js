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
var DIV_DUOSHUO;

var BUTTON_GVIM;   // 打开GVIM 进行编辑
var BUTTON_OPTION; // 用户打开弹出层进行信息修改

var CHAPTER_ID;
function DataInit()//从服务器得到数据信息
{
    var localhost = false;
    if (window.location.host == 'localhost')
    {
        localhost = true;
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
                  t.post = index[i][5];
                  if (!t.post && !localhost) continue;
                  INDEX.push(t);
              }
          },
    });
    $.ajax({
        url: URL_CLASS, 
        async : false,  
        success: function(cls){ 
            CLASS = cls; 
            DIV_CLASS.append($('<div>').text('全部(' + INDEX.length + ')' ));
            for (var c in CLASS)
            {
                var t = c + '(' + CLASS[c].length + ')';
                DIV_CLASS.append($('<div>').text(t));

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
        var t = $('<div>').text(INDEX[i].title);
        t[0].chapterid = INDEX[i].id;
        // 对于还没有正式发布的高亮显示
        if (!INDEX[i].post) t.css('color', 'red');
        DIV_LISTPOST.append(t);
    }
    $( document ).scrollTop( 0 /*DIV_LISTPOST.offset( ).top*/ );
    close_attach_auto();
}

function ClassShowListPost()// 通过类显示list post
{
    // 得到指定的类的id 的list
    var f = CLASS[$(this).text().split('(')[0]];
    ShowListPost(f);
}
function EShowChapter()// 用于事件回调
{
    
    window.location.href = 
        window.location.href.split("?")[0] + "?id=" + this.chapterid;
}

function DuoshuoShow(ID, Title, Url)
{
    DIV_DUOSHUO.attr('data-thread-id', ID);
    DIV_DUOSHUO.attr('data-thread-key', ID);
    DIV_DUOSHUO.attr('data-title', Title);
    DIV_DUOSHUO.attr('data-url', Url);
    duoshuoQuery['thread_key'] = ID;
    duoshuoQuery['thread_title'] = Title;
    DUOSHUO.EmbedThread(DIV_DUOSHUO[0]);
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


    var p = 'http://blog.fengidri.me/?id=' + ID;
    title.html($('<a>').text(info.title).attr('href', p));
    DuoshuoShow(ID, info.title, p);

    DIV_CHAPTER.show();
    EditShow();

    CHAPTER_ID = ID;

    CHAPTER_URL = URL_PREFIX + ID;

    var url = CHAPTER_URL + '/index.html';

    if (window.location.host == 'localhost')
        url = url + "?st=" + new Date().getTime();

    $.ajax({
        url:url, 
        async: false,
        success: function(data){
            content.html(data);
        }
    });
    index_init(DIV_INDEX, content, $('#index_switch'));
    $("pre").addClass("prettyprint");
    prettyPrint();
    // TODO 此时得到的index 的宽度总是1? 但是在resume里可以得正常的值
    close_attach_auto();
}

function EditWithGvim()
{
    $.post('/normal/gvim', {'arg': 'WikiGet ' + CHAPTER_ID}, 
        function(){});
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
function close_attach_auto()
{
    //必要的时候自动关闭, 附加的窗口
    var c_l, c_r;
    if($("#listpost").is(":visible"))
    {
        c_l = $("#listpost").offset().left;
        c_r = c_l + $("#listpost").width();
    }else{
        if($("#chapter").is(":visible"))
        {
            c_l = $("#chapter").offset().left;
            c_r = c_l + $("#chapter").width();
            if($("#index").offset().left + $("#index").width() > c_l)
                $("#index").hide();
            else
                $("#index").show();
        }else return;
    }


    if($("#class_div").offset().left < c_r)
        $("#class_div").hide();
    else
        $("#class_div").show();

}
$(document).ready(function(){
    //在窗口大小发生变化的时候调用些函数
    window.onresize = close_attach_auto;
    DIV_LISTPOST = $('div#listpost');
    DIV_HEADER   = $('div#header');
    DIV_CLASS    = $('div#class_div');
    DIV_CHAPTER  = $('div#chapter');
    DIV_INDEX    = $('div#index');
    DIV_DUOSHUO  = $('div.ds-thread');



    DIV_LISTPOST.on('click', 'div', EShowChapter);
    DIV_CLASS.on('click', 'div', ClassShowListPost);
    $('div#class_container h3').click(function(){
        $('div#class_div' ).toggle();
    });

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



