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
var TITLE;

var CHAPTER_ID;
function DataInit()//从服务器得到数据信息
{
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
    for (var c in CLASS)
    {
        if ($.inArray(ID, CLASS[c]))
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
    TITLE.hide();
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
    DIV_LISTPOST.hide();

    DIV_CHAPTER.html('...');
    DIV_CHAPTER.show();
    EditShow();

    TITLE.html(GetInfo(ID).title);
    TITLE.show();

    CHAPTER_ID = ID;

    CHAPTER_URL = URL_PREFIX + ID;

    var url = CHAPTER_URL + '/index.html';

    $.get(url, function(data){
        DIV_CHAPTER.html(data);
        index_init(DIV_INDEX, DIV_CHAPTER);
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

    BUTTON_GVIM = $("#edit #gvim");
    BUTTON_GVIM.click(EditWithGvim);
}




