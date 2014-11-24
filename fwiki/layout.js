var INDEX;
var CLASS;

var URL_INDEX    = '/store/index.json';
var URL_CLASS    = '/store/class.json';
var URL_PREFIX   = '/store/';

var DIV_LISTPOST;
var DIV_HEADER;
var DIV_CLASS;
var DIV_CHAPTER;
var DIV_INDEX;
function Init()//从服务器得到数据信息
{
    $.ajax({  
          url : URL_INDEX,  
          async : false,  
          success : function(index){ 
              //index = $.parseJSON(indxe); 
              index = index.reverse();
              INDEX = [];
              var i;
              var t = [];
              for (i in index)
              {
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
            for (var c in CLASS)
            {
                var t= "<button>" + c + "</button>";
                DIV_CLASS.append(t);

            }
        }
    });
}

function ShowListPost()// 显示list post
{
    DIV_LISTPOST.show();
    DIV_CHAPTER.hide();
    DIV_INDEX.hide();

    var filter = false;// 可能带有参数, 指定要显示的IDs
    if (arguments.length > 0) filter = arguments[0];

    $(DIV_LISTPOST).html('');
    for (var i in INDEX)
    {
        if (filter && jQuery.inArray(INDEX[i].id, filter) == -1)
                continue;
        var t = "<button value='" + INDEX[i].id +
            "'>" + INDEX[i].title + "</button>";
        DIV_LISTPOST.append(t);
    }
}

function ClassShowListPost()// 通过类显示list post
{
    ShowListPost(CLASS[$(this).text()]);
}

function ShowChapter()
{
    DIV_LISTPOST.hide();
    DIV_CHAPTER.show();

    var ID = $(this).attr('value');
    var url = URL_PREFIX + ID + '/index.html';
    $.get(url, function(data){
        DIV_CHAPTER.html(data);
        index_init(DIV_INDEX, DIV_CHAPTER);
    });

}
$(document).ready(function(){
    DIV_LISTPOST = $('div#listpost');
    DIV_HEADER   = $('div#header');
    DIV_CLASS    = $('div#class_div');
    DIV_CHAPTER  = $('div#chapter');
    DIV_INDEX    = $('div#index');

    DIV_LISTPOST.on('click', 'button', ShowChapter);
    DIV_CLASS.on('click', 'button', ClassShowListPost);
    alert(host = window.location.host);

    Init();
    ShowListPost();
});