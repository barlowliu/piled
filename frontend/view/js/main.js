var mainObj = {

    /**
     * 描述：点下按钮事件
     * 作者：Zoro.Zhu
     * **/
    'mousedown' : function () {
        var e = window.event;
        var obj = e.srcElement;
        var url = "http://192.168.188.38:8080/car/" + obj.alt + "/?a=1";
        $.ajax({
            type: "post",
            url: url,
            cache:false,
            async:false,
            dataType: "json",
            success: function(result){
                if(result.state != 200){
                    window.L.open('tip')(result.info,1000);
                }
            }
        });
    },

    /**
     * 描述：松开按钮事件
     * 作者：Zoro.Zhu
     * **/
    'mouseup' : function () {
        var e = window.event;
        var obj = e.srcElement;
        var url = "http://192.168.188.38:8080/car/" + obj.alt + "/?a=0";
        $.ajax({
            type: "post",
            url: url,
            cache:false,
            async:false,
            dataType: "json",
            success: function(result){
                if(result.state != 200){
                    window.L.open('tip')(result.info,1000);
                }
            }
        });
    }
};
