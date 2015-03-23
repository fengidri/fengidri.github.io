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
          dataType:'json',
          success : function(index){ 
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
        dataType:'json',
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
        t.append($('<span>').text(ChapterTime_(INDEX[i].ctime)));
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

function ChapterTime_(time)
{
    var date = new Date( time * 1000);
    var now = new Date();

    Y = date.getFullYear();
    if (Y == now.getFullYear())
        Y = '';
    else
        Y = (Y + '-').substring(2,5);

    M = date.getMonth();
    D = date.getDate();
    if (M == now.getMonth() && M == now.getDate())
        M = D = '';
    else
        if (Y !=  '')
            M = (M+1 < 10 ? '0'+(M+1) : M +1) + '-';
        else
            M = (M + 1) + '-';
        D = (D < 10 ? '0'+D : D) + ' ';

    h = date.getHours();
    m = date.getMinutes();
    if (h < 10)
        h = '0' + h;
    h = h + ':';
    if (m < 10)
        m = '0' + m;
    return Y+M+D+h+m;

}

function ChapterTime(info)
{
    return ChapterTime_(info.ctime);
}

function SplitPages(content)
{
    var hs = 1176; 
    var h = content.height();
    var p = $('div#page');
    var offset_l = content.offset().left + content.outerWidth();
    var offset_t = content.offset().top;
    var i;
    for(i=1; i< h/hs; i++)
    {
        var _p = p.clone();
        _p.show();
        $('body').append(_p);
        _p.offset({top: i * hs + offset_t, left: offset_l});
        _p.text(i + '.');
    }

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

    time.text(ChapterTime(info));
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
    ResizeImg(content.find('img'));
    SplitPages(content);
}

function ResizeImg(Imgs) // 调整图片的宽度
{
    function resize()
    {
        var w = DIV_CHAPTER.width() * 0.8;
        var img_w = $(this).width();//图片宽度 
        var img_h = $(this).height();//图片高度 
        if(img_w>w){//如果图片宽度超出容器宽度--要撑破了 
            var height = (w*img_h)/img_w; //高度等比缩放 
            $(this).css({"width":w,"height":height});//设置缩放后的宽度和高度 
        }
    }
    Imgs.each(function(){
        $(this).load(resize);
    });

}

function ShowImg(Imgs, ID) // 真实的img url 保存在date-src中
{
    Imgs.each(function(){
        url = $(this).attr('date-src');
        if (!url) return;
        if (url[0] == '/' || 
            url.substring(0,7) == 'http://' ||
            url.substring(0,8) == 'https://')
        {
            $(this).attr('src', url)
        }
        else{
            $(this).attr('src', 'store/' + ID + '/' + url);
        }
    });
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
//mm = $('<div#TX>').css('height', '10mm');
//$('body').append(mm)
//alert(mm.height())
//alert($('#my_mm').height())
});


