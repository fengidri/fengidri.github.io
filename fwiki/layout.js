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
                  t.post  = index[i][5];
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
    for (var i in INDEX) if (INDEX[i].id == ID) return INDEX[i];
}
function GetClass(ID)
{
    for (var c in CLASS) if ($.inArray(ID * 1, CLASS[c]) > -1) return c;
}

function ShowListPost()// 显示list post
{
    var filter = false;// 可能带有参数, 指定要显示的分类
    if (arguments.length > 0){
        var cname = arguments[0];
        filter = CLASS[cname];
    }

    DIV_LISTPOST.html('');
    for (var i in INDEX)
    {
        if (filter && jQuery.inArray(INDEX[i].id, filter) == -1)
            continue;

        var t = $('<div>').text(INDEX[i].title);
        var tt = $('<span>').text(ChapterTime_(INDEX[i].ctime));
        t.append(tt);

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
    var cname = $(this).text().split('(')[0];
    if (DIV_LISTPOST.length > 0)
    {
        ShowListPost(cname);
    }
    else{
        var c = encodeURIComponent(cname);
        var n = '/index.html?c=' + c;
        window.location.href = 
            window.location.href.replace(/\/[^/]*$/, n)
    }
}
function EShowChapter()// 用于事件回调
{
    var n = '/chapter.html?id=' + this.chapterid;
    window.location.href = 
        window.location.href.replace(/\/[^/]*$/, n)
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
