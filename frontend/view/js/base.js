/**
 *
 * 描述 : 1.生成悬浮框和按钮，并且绑定按钮事件。
 *       2.弹出框会延迟0.5秒弹出来
 * 参数 : e是 mouseover 的事件，whichBtn是按钮数组
 *           var btn = [
 *             {name:"修改"},{href:"/?c=show_main"},
 *             {name:"保存"},{href:"/?c=show_main"},
 *             {name:"删除"},{href:"/?c=show_main"}
 *             ];
 * 全局变量 : hasShowDetail 用来确定是否有悬浮框， isOnHover用来确定是否鼠标在悬浮框上面
 * 作者 : liubibo
 */

function hoverShowFrame() {
    var hasShowDetail = 0,
        isOnHover = 0,
        _this,
        $this,
        thisFun = arguments.callee,
        timeout,
        pageY,
        pageX;
    thisFun.createFrame = function (e, whichBtns, left, top) {
        pageY = e.pageY;
        pageX = e.pageX;
        isOnHover = 0;
        _this = e.currentTarget;
        $this = $(_this);
        if (e.type === "mouseenter" || e.type === "mouseover") {
            timeout = setTimeout(function () {
                thisFun.showDetail(e, whichBtns, left, top)
            }, 100);                                                                                                    //鼠标浮动，延迟半秒弹出 弹出框
        } else if (e.type === "mouseleave" || e.type === "mouseout") {
            thisFun.mouseleaveFun(e, whichBtns, left, top);
        }
    };
    thisFun.showDetail = function (e, whichBtns, left, top) {
        if (!hasShowDetail) {
            var pageWidth = $('body').width(),
                pageHeight = $('body').height();
            var popDetails = $('<div></div>').addClass('pop-details');
            var detailWidth;
            var detailHeight;
            if (!whichBtns || whichBtns.length <= 0) {
                var thisBtn = $("<p>不能对该订单操作</p>");
                popDetails.append(thisBtn);
            } else {
                whichBtns.forEach(function (item, index, array) {
                    var thisBtn;
                    if (!$.isArray(item) && typeof item == "object") {
                        item.attr = !!item.attr ? item.attr : "";
                        thisBtn = $('<input type="button" class="btn btn-default btn-xs jsPopButtons ' +
                            item.class + '" value="' + item.name + '" href="' + item.href + '" ' + item.attr + '>');
                        thisBtn.on('click', item.func);
                    } else if (typeof item == "string") {
                        thisBtn = $("<p>" + item + "</p>");
                    }
                    popDetails.append(thisBtn);                                                                         //用于悬浮框的按钮添加监听
                });
            }
            $('body').append(popDetails);
            checkAuthorize('.pop-details');                                                                             //弹出的按钮，是否存在authorize-kind属性，有则触发进行检测权限
            detailWidth = popDetails.outerWidth();                                                                      //用来弹出框的高度和宽度
            detailHeight = popDetails.outerHeight();
            pageX = !!left ? left : pageX;
            pageY = !!top ? top : pageY;
            if (pageX > pageWidth / 2) {                                                                                //用于鼠标浮动之后获取鼠标坐标位置，如果鼠标在屏幕右侧， 弹出框则出现在鼠标左侧
                popDetails.css('right', ( pageWidth - pageX ) + 'px');
            } else {
                popDetails.css('left', (  pageX ) + 'px');
            }
            popDetails.css('top', ( $this.offset().top - detailHeight ) + 'px');
            hasShowDetail = 1;

            $('body > .pop-details').on('mouseenter', function () {                                                     //监听鼠标是否在悬浮框上面
                $this.addClass('hoverTrBG');
                isOnHover = 1;
            }).on('mouseleave', function () {
                $(this).remove();
                $this.removeClass('hoverTrBG');
                isOnHover = 0;
                hasShowDetail = 0;
            });
        }
    };
    thisFun.mouseleaveFun = function (e, whichBtns, left, top) {
        var $this = $(this);                                                                                            //用于监听鼠标离开之后清除悬浮框
        isOnHover = 0;
        clearTimeout(timeout);
        setTimeout(function () {
            if (!!hasShowDetail && !isOnHover) {
                $this.removeClass('hoverTrBG');
                $('body > .pop-details').remove();
                hasShowDetail = 0;
            }
        }, 100);
    };
    thisFun.mousemoveFun = function () {
        var $this = $(this);                                                                                            //用于监听鼠标离开之后清除悬浮框
        if (!hasShowDetail && !isOnHover) {                                                                             //添加判断
            clearTimeout(timeout);
            timeout = setTimeout(thisFun.showDetail, 100);                                                              //鼠标浮动，延迟半秒弹出 弹出框
        }
    };
}
hoverShowFrame();                                                                                                       //初始化
/**
 *   描述 : 用于检测页面全部input或者select的功能
 *   子功能: checkfunction.checkfor为检测当前按钮处的form全部的对象 参数（object） 如 ('.submitInputsClass');
 *           checkfunction.checkfun为检测页面单个对象  参数(checkfor, checkObj)   如('检测类型','.inputsClass')；
 *                       检测类型 : 'user_tel' 手机号
 *                                'user_password' 密码  4-16位的汉字数字密码
 *                                'message' 信息 6位字符以上的信息
 *                                'password_confirm' 确认密码 会和密码（user_password）匹配
 *                                'advice_title' 建议标题 4位字符以上信息
 *                                'not_empty' 内容非空
 *                                'float_neg' 负数浮点
 *                                'float_number' 是否是浮点数
 *                                'float_number_nozero' 正浮点（非零）
 *                                'float_number_nozero' 正浮点（非零）
 *                                'integer' 是否是正整数
 *                                'integer_nozero' 正整数（非零）
 *                                'selected' 是否选择
 *                                'delay_date' 时间插件加载后的时间
 *  附加显现 : 检测对象包含attr（'tab-tip-target'）,意味着要联动显示，所有该attr的没有填写时候，都会对tab-tip-target对应的class标记一个tip
 *  作者 : liubibo
 */
var checkfunction = {
    appendTip: function (target) {                                                                                     //用于添加tab上的tip（tip提示必填项）
        var _thisFun = this;
        var thisObj = $(target);
        if (thisObj.find('.tip-wrapper.tip-necessary') === undefined || thisObj.find('.tip-wrapper.tip-necessary').length <= 0) {
            thisObj.addClass('positionR').append(_thisFun.createTip());
        }
    },
    createTip: function () {                                                                                           //用于创建一个tip并返回。
        var tip = $('<div class="tip-wrapper tip-necessary up-down-move positionA" style="background-color: rgba(255, 0, 0, 0.64);padding:2px;font-size:10px;top:-10px;right:-5px; color:#fff;border-radius:5px;z-index:10;">必填</div>');
        return tip;
    },
    /**
     * 描述 : 1.用来每个输入框离开时候检测tab-tip-target同类型的是否有不符合要求的。
     *       2.当删除一行的时候，
     * 参数 :
     *      obj: 传递改对象
     *      passSelf: 关闭自身检测
     *      tipTarget: 找到对应必填tip的位置。检查是不是需要关闭tip
     * 作者 : liubibo
     */
    singleTrigger: function (obj, passSelf, tipTarget) {                                                               //用来每个输入框blur之后进行检测，并且判断是否要展示tip或者关闭tip。
        var $this = $(obj);
        var _thisFun = this;
        var $thisForm = $this.closest('form');
        var checkfor = $this.attr('checkfor');
        var tabTipObj = !!tipTarget ? tipTarget : $this.attr('tab-tip-target');
        var checkResult = _thisFun.checkfun(checkfor, $this);
        if (!!passSelf || !!tabTipObj) {                                                                                //有tab-tip-target属性,则检测是否需要添加tip或者取消tip
            if (!!passSelf || checkResult) {                                                                            //如果检测该输入框正确，则判断具有同个tab-tip-target的同类，是不是都是正确的，正确则取消tip
                var thisKindCheck = $thisForm.find('[tab-tip-target="' + tabTipObj + '"]');
                if (thisKindCheck.length > 0) {
                    var canCancelTip = 1;
                    thisKindCheck.each(function () {
                        if ($(this).hasClass('notRight')) {
                            canCancelTip = 0;
                            return false;
                        }
                    });
                    if (!!canCancelTip) {
                        $thisForm.find('.' + tabTipObj).find('.tip-wrapper.tip-necessary').remove();
                    }
                } else {                                                                                                //当没有该类的存在时候，可能是删除掉了，关闭必填tip
                    $thisForm.find('.' + tabTipObj).find('.tip-wrapper.tip-necessary').remove();
                }
            } else {                                                                                                    //如果检测输入框不正确，直接尝试添加tip
                _thisFun.appendTip($thisForm.find('.' + tabTipObj).get(0));
            }
        }
    },
    checkfor: function (object) {
        var thisForm = !!$(object).get(0).tagName === "form" ? $(object) : $(object).closest('form');
        var checkObject = thisForm.find('[checkfor]');
        var checkResult = true;
        var _thisFun = this;
        if (checkObject.length > 0) {
            checkObject.each(function () {
                var checkfor = $(this).attr('checkfor');
                var tabTipObj = $(this).attr('tab-tip-target');
                if (!!checkfor) {
                    if (checkfor != "submit") {
                        var checkInput = $(this).find('input');
                        if (checkInput.length > 0) {
                            if (!_thisFun.checkfun(checkfor, checkInput)) {
                                checkResult = false;
                                if (!!tabTipObj) {
                                    var tabTipObjOne = thisForm.find('.' + tabTipObj).get(0);
                                    _thisFun.appendTip(tabTipObjOne);
                                }
                            }
                        } else {
                            if (!_thisFun.checkfun(checkfor, this)) {
                                checkResult = false;
                                if (!!tabTipObj) {
                                    var tabTipObjOne = thisForm.find('.' + tabTipObj);
                                    _thisFun.appendTip(tabTipObjOne);
                                }
                            }
                        }
                    }
                }
            });
        }
        return checkResult;
    },
    checkfun: function (checkfor, checkObj) {                                                                           //检查单个input或者select 按钮的功能
        var checkVal = "";
        var result;
        var _thisFun = this;
        if ($.trim($(checkObj).val()) != "") {
            checkVal = $(checkObj).val();
        } else if ($.trim($(checkObj).text()) != "" && checkfor != "selected") {                                        //下拉框如果没有选择，不能用text；
            checkVal = $(checkObj).text()
        }
        if (checkfor == "user_tel") {
            checkVal = checkVal.replace(/[\W]*/, '');
            result = /1\d{10}/.test(checkVal);
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "user_password") {
            result = /[0-9a-zA-Z_]{4,16}/.test(checkVal);
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "message") {
            result = /^\d{6}$/.test(checkVal);
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "password_confirm") {
            var originalVal = checkArea.find('input[checkfor="user_password"],button[checkfor="user_password"]').val();
            var regex = new RegExp("\^" + originalVal + "\$");
            result = regex.test(checkVal);
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "advice_title") {
            result = /[\w\d]{4,}/.test(checkVal);
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "advice_content") {
            result = /[\w\d]{4,}/.test(checkVal);
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "not_empty") {
            if (checkVal.length > 0) {
                result = true;
            } else {
                result = false;
            }
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "start_number") {
            result = /^\d+/.test(checkVal);
            _thisFun.highlight(result, checkObj);
        }else if(checkfor == "start_number_s"){
        	result = /^[A-Za-z0-9]+/.test(checkVal);
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "float_number") {
            result = /^\d+(\.\d*)?$/.test(checkVal);
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "float_neg") {
            result = /^-\d+(\.\d*)?$/.test(checkVal);
            result = result && parseFloat(checkVal) !== 0 ? true : false;
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "float_number_nozero") {
            result = /^\d+(\.\d*)?$/.test(checkVal);
            result = result && parseFloat(checkVal) !== 0 ? true : false;
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "float_number_and_neg") {
            result = /^[+-]?\d+(\.\d*)?$/.test(checkVal);
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "integer") {
            result = /^\d+$/.test(checkVal);
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "integer_nozero") {
            result = /^\+?[1-9][0-9]*$/.test(checkVal);                                                                 //非零的正整数
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "selected") {
            if (checkVal.length > 0) {
                result = true;
                $(checkObj).off('change.select');
            } else {
                result = false;
                $(checkObj).on('change.select', function () {
                    _thisFun.checkfun('selected', this);
                });
            }
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "delay_date") {                                                                          //判断日期插件的功能
            result = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})(\s{1,2}([0-2]?[0-9])\:([0-5]?[0-9])\:([0-5]?[0-9]))?$/.test(checkVal);
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "email") {
            result = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(checkVal);
            _thisFun.highlight(result, checkObj);
        } else if (checkfor == "float_number_nozero_null") {
            result = /^\d+(\.\d*)?$/.test(checkVal);
            if (result && parseFloat(checkVal) !== 0) {
                result = true;
            } else if (checkVal === '') {
                result = true;
            } else {
                result = false;
            }
            _thisFun.highlight(result, checkObj);
        }
        return !!result;
    },
    highlight: function (lightOff, checkContent) {                                                                      //高亮提示
        if (!checkContent) {
            checkContent = $('body');
        } else {
            checkContent = $(checkContent);
        }
        if (!lightOff) {
            var placeholder = ( typeof checkContent.attr('alertfor') != "undefined" ) ? checkContent.attr('alertfor') : ( typeof checkContent.parent().attr('alertfor') != "undefined" ) ? checkContent.parent().attr('alertfor') : "请重新输入";
            checkContent = checkContent.find('input').length > 0 ? checkContent.find('input') : checkContent;           //用于判断当前是文字还是input框，input框需要在input上面高亮提示
            checkContent.css('background-color', '#faffbd').attr('placeholder', placeholder).val("");
            checkContent.addClass('notRight');
        } else {
            checkContent.css('background', '');
            checkContent.removeClass('notRight');
        }
    }
};
var assignMsg = {
    /**
     * 描述 : 操作指定类型的分页
     * 参数 : type : 分页类型
     *       mode : 操作模式, 默认=搜索, 其它=分页操作
     * 返回 :
     */
    'paging': function (type, mode) {
        var paging = document.getElementById(type + 'Info');//分页对象
        paging.paging(mode);
    },
    /**
     * 描述 : 分页搜索部分，点击选择分配订单或者标记等功能
     * 参数 : argsObj  : {
     *          type : 点击按钮回调内置的函数（按钮上的callback属性）
     *          e : 点击事件,
     *          obj : 点击按钮,
     *          url : 向后台请求的地址
     *          orderArr : 向后台请求的地址
     *      }
     * 作者 : liubibo
     */
    'handleMsg': function (argsObj) {
        var e = argsObj.e || window.event || arguments.callee.caller.arguments[0];
        var thisT = argsObj.obj || e.currentTarget;
        var $this = $(thisT);
        var thisFun = arguments.callee;
        var url = argsObj.url;
        var type = argsObj.type;
        // var data = argsObj.orderArr;
        var selectedIndex = [];
        var orderArr = [];
        var $table = $('.table-wrapper').find('table');
        var $trs = $table.find('.of-paging_body').find('tr');
        var tableDate = $table.get(0).data;
        var $selectedTrs = {};
        var functionOpt;
        /**
         * 描述 : 用于批量分配回调函数，向后台请求数据，并且标记颜色的，成功标红，失败标绿。
         * 参数 : args : {
         *          url : 后台请求数据地址,
         *          sendData : 向后台请求数据,
         *          btn : jq按钮元素,
         *          selectedTrs : 为选择的行jq元素
         *      }
         * 作者 : liubibo
         */
        thisFun.taskAllocated = function (args) {
            args.sendData.servicer = args.btn.val();
            args.sendData.changeHead = 0;
            if (args.sendData.platform === 'EB') {
                if ($('.jsChangeHead').prop('checked')) {
                    args.sendData.changeHead = 1;
                }
            }
            if (confirm('是否将邮件分配给【' + args.sendData.servicer + '】')) {
                $.ajax({
                    url: args.url,
                    type: "POST",
                    dataType: "JSON",
                    data: args.sendData,
                    beforeSend: function () {                                                                           //当触发ajax时候，页面添加一个半透明灰色背景
                        args.btn.attr('disabled', true);
                    },
                    success: function (data) {
                        ajaxCallbackHint(true)(data, 'state', 'info', true, '分配成功', '分配失败', 'closeBtn');
                        if (data.errorId) {                                                                             //成功的id标红
                            $.each(data.errorId, function (i, id) {
                                args.selectedTrs[id].css({'background-color': '#ddd', 'color': '#f2dede'});
                            });
                        }
                        if (data.rightId) {                                                                             //成功的id标绿
                            $.each(data.rightId, function (i, id) {
                                args.selectedTrs[id].css({'background-color': '#ddd', 'color': '#dff0d8'});
                            });
                        }
                    },
                    error: function (error) {                                                                           //临时用于，后台保存成功，state为true，但是后台返回报错的情况
                        ajaxCallbackHint(false)(error, 'state', 'info', true, '分配成功', '分配失败', true);
                        args.btn.val("");
                    },
                    complete: function () {                                                                             //接触锁定页面的半灰色背景
                        args.btn.attr('disabled', false);
                    }
                });
            }
        };
        /**
         * 描述 : 用于批量分配新邮件回调函数，向后台请求数据
         * 参数 : args : {
         *          url : 后台请求数据地址,
         *          sendData : 向后台请求数据,
         *          btn : jq按钮元素,
         *          selectedTrs : 为选择的行jq元素
         *      }
         * 作者 : Kevin
         */
        thisFun.toAllocated = function (args) {
            args.sendData.servicer = args.btn.val();
            args.sendData.changeHead = 0;
            if (args.sendData.platform === 'EB') {
                if ($('.jsChangeHead').prop('checked')) {
                    args.sendData.changeHead = 1;
                }
            }
            if (confirm('是否将邮件分配给【' + args.sendData.servicer + '】')) {
                $.ajax({
                    url: args.url,
                    type: "POST",
                    dataType: "JSON",
                    data: args.sendData,
                    beforeSend: function () {                                                                           //当触发ajax时候，页面添加一个半透明灰色背景
                        args.btn.attr('disabled', true);
                    },
                    success: function (data) {
                        ajaxCallbackHint(true)(data, 'state', 'info', true, '分配成功', '分配失败', 'closeBtn');
                    },
                    error: function (error) {                                                                           //临时用于，后台保存成功，state为true，但是后台返回报错的情况
                        ajaxCallbackHint(false)(error, 'state', 'info', true, '分配成功', '分配失败', true);
                        args.btn.val("");
                    },
                    complete: function () {                                                                             //接触锁定页面的半灰色背景
                        args.btn.attr('disabled', false);
                    }
                });
            }
        };
        thisFun.moveMessage = function (args) {
            if (confirm('是否将邮件移动到待处理')) {
                $.ajax({
                    url: args.url,
                    type: "POST",
                    dataType: "JSON",
                    data: args.sendData,
                    beforeSend: function () {                                                                           //当触发ajax时候，页面添加一个半透明灰色背景
                        args.btn.attr('disabled', true);
                    },
                    success: function (data) {
                        ajaxCallbackHint(true)(data, 'state', 'info', true, '移入待处理成功', '移入待处理失败', 'closeBtn');
                        if (data.errorId) {                                                                             //成功的id标红
                            $.each(data.errorId, function (i, id) {
                                args.selectedTrs[id].css({'background-color': '#ddd', 'color': '#f2dede'});
                            });
                        }
                        if (data.rightId) {                                                                             //成功的id标绿
                            $.each(data.rightId, function (i, id) {
                                args.selectedTrs[id].css({'background-color': '#ddd', 'color': '#dff0d8'});
                            });
                        }
                    },
                    error: function (error) {                                                                           //临时用于，后台保存成功，state为true，但是后台返回报错的情况
                        ajaxCallbackHint(false)(error, 'state', 'info', true, '移入待处理成功', '移入待处理失败', true);
                    },
                    complete: function () {                                                                             //接触锁定页面的半灰色背景
                        args.btn.attr('disabled', false);
                    }
                });
            }
        };
        thisFun.markRead = function (args) {
            if (confirm('是否将邮件标记为已读')) {
                args.sendData.isSyncPlat = confirm('注意：是否需要将标记已读同步到平台?');
                $.ajax({
                    url: args.url,
                    type: "POST",
                    dataType: "JSON",
                    data: args.sendData,
                    beforeSend: function () {
                        args.btn.attr('disabled', true);
                    },
                    success: function (res) {
                        window.L.open('tip')(res.msg);
                    },
                    error: function () {
                        window.L.open('tip')('连接失败');
                    },
                    complete: function () {
                        args.btn.attr('disabled', false);
                    }
                });
            }
        };
        thisFun.setDraft = function (args) {
            if (confirm('是否将邮件草稿内容发送出去')) {
                $.ajax({
                    url: args.url,
                    type: "POST",
                    dataType: "JSON",
                    data: args.sendData,
                    beforeSend: function () {                                                                           //当触发ajax时候，页面添加一个半透明灰色背景
                        args.btn.attr('disabled', true);
                    },
                    success: function (data) {
                        ajaxCallbackHint(true)(data, 'state', 'info', true, '发送成功', '发送失败', 'closeBtn');
                    },
                    error: function (error) {                                                                           //临时用于，后台保存成功，state为true，但是后台返回报错的情况
                        ajaxCallbackHint(false)(error, 'state', 'info', true, '发送成功', '发送失败', true);
                    },
                    complete: function () {                                                                             //接触锁定页面的半灰色背景
                        args.btn.attr('disabled', false);
                    }
                });
            }
        };
        thisFun.batchOpen = function (args) {
            var temp_form = document.createElement("form");
            temp_form .action = args.url;
            temp_form .target = "_blank";
            temp_form .method = "post";
            temp_form .style.display = "none";
            for (var x in args.sendData) { var opt = document.createElement("textarea");
                opt.name = x;
                opt.value = args.sendData[x];
                temp_form .appendChild(opt);
            }
            document.body.appendChild(temp_form);
            temp_form.submit();
        };
        $trs.each(function (i, t) {
            if ($(this).find('.jsFollowSelect').prop('checked')) {
                selectedIndex.push(i);
            }
        });
        if (selectedIndex.length === 0) {
            if ($this.get(0).tagName === 'SELECT') {
                $this.val("");
            }
            L.open('tip')("请选择至少一条数据操作", 3000);
            return false;
        }
        $.each(selectedIndex, function (i, thisIndex) {
            var channelId = !!tableDate ?  tableDate[thisIndex].id :  -1;
            var msgState = !!tableDate ? tableDate[thisIndex].msgState : -1;
            if (channelId === -1 || msgState === -1) {
                console.error("批量操作中对象%s ,没有找到对应数据", $trs.eq(thisIndex).get(0));
                return false;
            }
            orderArr.push(channelId);
            $selectedTrs[channelId] = $trs.eq(thisIndex);
        });
        functionOpt = {
            sendData: {
                orderArr: orderArr,
                platform : $this.attr('platform'),
                feature : $this.attr('feature')
            },
            btn: $this, selectedTrs: $selectedTrs, url: url
        };
        thisFun[type](functionOpt);
    },
    'changeRank': function (argsObj) {
        var e = argsObj.e || window.event || arguments.callee.caller.arguments[0];
        var thisT = argsObj.obj || e.currentTarget;
        var $this = $(thisT);
        var randomId = $this.data('random-id');
        var top = $this.offset().top;
        var left = $this.offset().left;
        var $selectRank = $('.jsRankFun');
        e.stopPropagation();
        if (!randomId) {
            randomId = 'rankId' + (Math.random() * 10000).toFixed(0);
            $this.data('random-id', randomId);
        }
        if ($selectRank.length === 0) {
            $selectRank = $(
                '<div class="positionA rank-wrapper jsRankFun" data-random-id="' + randomId + '"> ' +
                '   <ul class="rank-icons">' +
                '       <li class="tag-icon tag-icon-0" data-rank="0"></li>' +
                '       <li class="tag-icon tag-icon-1" data-rank="1"></li>' +
                '       <li class="tag-icon tag-icon-2" data-rank="2"></li>' +
                '       <li class="tag-icon tag-icon-3" data-rank="3"></li>' +
                '       <li class="tag-icon tag-icon-4" data-rank="4"></li>' +
                '       <li class="tag-icon tag-icon-5" data-rank="5"></li>' +
                '   </ul>' +
                '</div>');
            $('body').append($selectRank);
            $selectRank.css({
                top: top + 20,
                left: left - $selectRank.outerWidth() / 2 + $this.width() / 2
            });
            $selectRank.on('click', 'li', function (e) {
                var selectedRank = $(this).data('rank');
                if (selectedRank === $this.data('rank')) {
                    e.stopPropagation();
                    L.open('tip')('不能选择同样的标签', 3000);
                } else {
                    // assignMsg.updateRank($this, selectedRank);                                                       //暂未对接
                    L.open('tip')('暂未开放功能', 3000);
                }
            });
            $('body').on('click.rand-wrapper', function () {
                $selectRank.remove();
                $('body').off('click.rand-wrapper');
            });
        } else if ($selectRank.data('random-id') !== randomId) {
            $selectRank.css({
                top: top + 20,
                left: left - $selectRank.outerWidth() / 2 + $this.width() / 2
            });
        } else {
            $selectRank.remove();
        }
    },
    'updateRank': function (argObj) {
        var $btn = argObj.btn;
        var url = argObj.url;
        var data = {mainMsgId: $("#mainMsgId").val(), salesAccount: $("#salesAccount").val(), rank: $(obj).val()};
        $btn.attr('class', $obj.attr('class').replace(/(tag-icon-)\d{1,2}/, "$1" + rank));
        $btn.data('rank', rank);
        var orderId = $obj.data('order-id');
        $.each($btn.closest('table').get(0).data, function (i, thisData) {
            if (thisData.orderId == orderId) {
                thisData.rank = rank;
            }
        });
        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            dataType: 'JSON',
            beforeSend: function () {
                $btn.addClass('icon-shining');
            },
            success: function (json) {
                var result = ajaxCallbackHint(true)(json, 'state', 'info', true, "操作成功", "操作失败", false);
                if (result) {
                    $btn.get(0).className = $btn.get(0).className.replace(/(tag-icon-)\d{1,2}/, $1 + $obj.data('rank'));
                }
            },
            error: function (error) {
                ajaxCallbackHint(false)(error, 'state', 'info', true, "操作成功", "接口超时,请稍后再试", false);
            },
            complete: function () {
                $btn.removeClass('icon-shining');
            }
        });
    }
};
/**
 * 描述 : 当页面有checkfor功能，添加星号，表示必填项
 * 作者 : liubibo
 */
$('form').find('[checkfor]').each(function () {
    var dot = $('<span class="star-dot">*</span>');
    $(this).closest('.input-group').append(dot);
});
/**
 * 描述 : 分页列表自带的数据，初始之后直接填充对应的搜索框（主要用于刷新页面时候）
 * 作者 : liubibo
 */
function fillSearchInput(type) {
    var $thisFun = arguments.callee,
        $thisTable = $(this),
        $params;
    $thisFun.checkString = function (obj) {
        if (typeof obj === "string") {
            return true;
        } else {
            return false;
        }
    };
    /**
     * 描述 : 用于遍历数据，然后将数据填充到数据框，其中数据结构不确定（可能数据结构如下）
     * 原理 : 遍历 value是字符，就直接根据name = key 填充。如果时间结构 填充数据到页面的name = createTime[0] 和 name = createTime[1]中。
     * var a = {
     *     "globalOrder": "11",
     *      "common": [{"platformOrder": "11"}, {"platformType": "EB"}, {"receiverName": "1"}, {"orderState": "10"}, {"buyerUser": "11"}, {"salesAccount": "12deeping"}],
     *      "time": [{"createTime": ["2016-07-04", "2016-06-29"]} ,{"ratingTime": ["2016-07-1", "2016-06-1"]} ]
     * };
     * 作者 : liubibo
     */
    $thisFun.eachObj = function (ob) {
        var isString = false,
            storeKey = [];

        /**
         * 描述 : 用于递归遍历，其中eachTime函数内部是用于递归 time组的数据
         * 作者 : liubibo
         */
        function each(obj) {
            for (var key in obj) {
                if (key === "time") {
                    storeKey.push(key);
                    function eachTime(obje) {
                        for (var key2 in obje) {
                            if ($thisFun.checkString(obje[key2])) {                                                     //如果当前是字符串，直接填充数据到页面。
                                $('[name="' + storeKey[storeKey.length - 1] + '[' + key2 + ']"]').val(obje[key2]);      //  name =  createTime[0] ， name =  createTime[1]
                                if (!$.isArray(obje)) {
                                    storeKey.pop();                                                                     //如果当前遍历的是不一个数组，删掉最后一个key
                                }
                                continue;
                            } else {
                                storeKey.push(key2);
                                arguments.callee(obje[key2]);                                                           //递归子数据遍历
                            }
                        }
                    }

                    eachTime(obj[key]);
                } else {
                    if ($thisFun.checkString(obj[key])) {
                        var $input = $('[name="' + key + '"]');
                        var $prefix = $input.data('prefix');
                        var $reg = "/^" + $prefix + "(.+)/";
                        var $thisVal = obj[key].trim();
                        $reg = eval($reg);
                        if (!!$thisVal) {
                            var $result = $thisVal.match($reg);
                            if (!!$result && !!$result[1]) {
                                $thisVal = $result[1];
                            }
                            if ($input.attr('type') === 'radio' || $input.attr('type') === 'checkbox') {
                                $input.filter('[value='+ $thisVal +']').attr('checked','checked');
                                $input.not('[value='+ $thisVal +']').removeAttr('checked');
                            } else {
                                $input.val($thisVal);
                            }
                        }
                        continue;
                    } else {
                        arguments.callee(obj[key]);                                                                     //递归子数据遍历
                    }
                }
            }
        }

        each(ob);
    };
    /**
     * 描述 : 用于将分页 paging after功能回掉的函数
     * 参数 : type: after；
     *       this: table；
     * 作者 : liubibo
     */
    $thisFun.getObj = function (type) {
        var $search;
        if (!!$thisTable.attr('params')) {
            $search = JSON.parse($thisTable.attr('params'));
            $search = !!$search && !!$search.search ? $search.search : '';
        }
        if (!!$search) {
            return $search;
        }
    };
    $params = $thisFun.getObj(type);
    $thisFun.eachObj($params);
}
L.data('paging.after[]', fillSearchInput);                                                                              //分页加载之后，填充搜索条件。
/**
 * 作用 : 用于分页回调之后显示多少条
 * 作者 : liubibo
 */
function showItemsNumber(type) {
    var $this = $(type);
    var info = type.paging(null);
    if (info.items) {
        var $items = $this.find('[name="pagingItems"]');
        if ($items.length === 0) {
            $items = $('<span name="pagingItems" class="of-paging_page add-distance">' + info.items + '</span>');
        } else {
            $items.text(info.items);
        }
        $this.find('.of-paging_action').find('[name="pagingFirst"]').before($items);
    } else {
        $this.find('[name="pagingItems"]').remove();
    }
}

/**
 * 描述 : 搜索框传值给后台分页
 * 作者 : hfw
 * 功能 : 用于search-form所有name元素，拼成一个数组，如该元素有data-name-group，就以该group分组，不然则不分组
 */
function searchOrderList(obj) {
    var thisFun = arguments.callee;
    var args = {};
    var index;                                                                                                          //用来判断input.name[0(或者1)]下标，放到对应name数组的对应下标中[index]
    var thisName, thisVal;
    var nameGroup;                                                                                                      //用来判断分组
    var filterEmpty;                                                                                                    //用来判断input传入数据非空是否过滤
    var prefix;
    /**
     * 描述 : 判断该数据的种类，返回string，object，array
     */
    thisFun.checkType = function (objVal) {
        if (typeof objVal === "string") {
            return "string";
        } else if ($.isArray(objVal)) {
            return "array";
        } else if (typeof objVal === "object" && objVal.constructor.name === "object") {
            return "object";
        }
    };
    /**
     * 描述 : 判断是不是为空，为空返回true；
     */
    thisFun.isEmpty = function (objVal) {
        if (objVal === undefined || objVal === null || objVal === "") {
            return true;
        } else if ($.isArray(objVal)) {
            if (objVal.length === 0) {
                return true;
            }
        } else if (typeof objVal === "object" && objVal.constructor.name === "Object") {
            for (var key in objVal) {
                return false;
            }
            return true;
        } else {
            return false;
        }
    };
    /**
     * 描述 : 用来判断该元素将如何放到args对象里面，返回group:true（false），nameArr:true（false）
     *   如果group:true 且nameArr:true   则  例子: args = { group:[ {nameArr:[] }] }
     */
    thisFun.groupType = function (name, group) {
        var regex = /(^.+?)\[(\d)\]/;                                                                                   //用来判断name是不是 name = *[0]格式，如果是，则是数组，并且为数组的第一个
        var result = name.match(regex);
        var isGroup = false, isNameArr = false, realName = name;
        if (!!result) {
            realName = result[1];
            index = result[2];
            isNameArr = true;
        }
        if (!thisFun.isEmpty(group)) {
            isGroup = true;
        }
        return {group: isGroup, nameArr: isNameArr, realName: realName};
    };
    /**
     * 用来判断是否为空，为空则按类型新建一个空的（数组，字符串，对象）
     */
    thisFun.emptyCreate = function (obj, key, creataType) {
        if (thisFun.isEmpty(obj[key])) {
            if (creataType === "object") {
                obj[key] = {};
                return true;
            } else if (creataType === "array") {
                obj[key] = [];
                return true;
            } else if (creataType === "string") {
                obj[key] = "";
                return true;
            }
        }
        return false;
    };
    /**
     * 描述 : 判断输入的数组（内包含对象）是不是有存在对应的数据，如果不存在，则进行添加创建。
     */
    thisFun.arrObjCheckInsert = function (arrObj, thisKey, nameArr) {
        var isExist = false;
        if (!thisFun.emptyCreate(arrObj, 0, "object")) {                                                                //当 time:[空]，则time:[{空}]
            for (var i in arrObj) {                                                                                     //当time:[{x:?}]结构，直接遍历time的数组
                for (var key in arrObj[i]) {                                                                            //当time:[{x:?}]结构，遍历time数组下的对象，尝试找到对应键名的对象
                    if (key == thisKey) {                                                                               //如果找到对应键名的对象，time:[{thisKey:?}]
                        if (!!nameArr) {                                                                                //判断name是不是数组，既不是 name[0(1)]
                            thisFun.emptyCreate(arrObj[i], thisKey, "array");
                            var arrResult = thisFun.arrCheckInsert(arrObj[i][thisKey], index);                          //当对象下的arr数组都是为空的，则返回emptyArr = true;
                            if (arrResult.emptyArr) {                                                                   //全部为空，清空该对象
                                arrObj.splice(i, 1);
                            }
                        } else {
                            arrObj[i][thisKey] = thisVal;
                        }
                        isExist = true;
                    }
                }
            }
        }
        if (!isExist) {
            var tempObj = {};
            var arrResult;
            if (!!nameArr) {                                                                                            //当name是数组模式时候，
                tempObj[thisKey] = [];
                if (thisFun.isEmpty(arrObj[0])) {                                                                       //判断数组的第一位为空，不存在则直接插入
                    arrObj[0] = tempObj;
                } else {                                                                                                //判断数组的第一位不为空，push到最后
                    arrObj.push(tempObj);
                }
                arrResult = this.arrCheckInsert(arrObj[arrObj.length - 1][thisKey], index);                             //当对象下的arr数组都是为空的，则返回emptyArr = true;
                if (arrResult.emptyArr && nameArr) {                                                                    //全部为空，清空该对象
                    for (var i in arrObj) {                                                                             //当time:[{x:?}]结构，直接遍历time的数组
                        for (var key in arrObj[i]) {                                                                    //当time:[{x:?}]结构，遍历time数组下的对象，尝试找到对应键名的对象
                            if (key == thisKey) {                                                                       //如果找到对应键名的对象，time:[{thisKey:?}]
                                arrObj.splice(i, 1);
                            }
                        }
                    }
                }
            } else {                                                                                                    //当name不是数组模式的时候
                tempObj[thisKey] = thisVal;
                if (thisFun.isEmpty(arrObj[0])) {                                                                       //判断数组的第一位为空，不存在则直接插入
                    arrObj[0] = tempObj;
                } else {                                                                                                //判断数组的第一位不为空，push到最后
                    arrObj.push(tempObj);
                }
            }
        }
    };
    /**
     * 描述 : 判断传入的数组，对应的ind下标是否存在，没有则进行添加，ind下标之前的位置，是否有填充，没有填充则进行添加["","",ind] inde =2;
     */
    thisFun.arrCheckInsert = function (arr, ind) {                                                                      //传入数组,判断下标ind是不是有，
        var isExist = false;                                                                                            //用来判断ind之前的下标是否有内容
        var emptyArr = true;                                                                                            //用来判断所有下标是否都是空。
        if (ind > 0 && arr.length <= ind + 1) {
            for (var k = 0, l = ind; k < l; k++) {
                if (!thisFun.emptyCreate(arr, k, "string")) {
                    isExist = true;
                    emptyArr = false;
                }
            }
        } else {
            for (var l = arr.length - 1; l > ind; l--) {
                if (!thisFun.isEmpty(arr[l])) {
                    emptyArr = false;
                }
            }
        }
        if (isExist || !!thisVal) {
            emptyArr = false
        }
        arr[ind] = thisVal;                                                                                             //填充到数组里面
        return {isExist: isExist, emptyArr: emptyArr};
    };
    /**
     * 描述 : 用来清空args中的空数组结构。args{ time:[空]};
     */
    thisFun.clearEmptyGroup = function (obj) {
        for (var key in obj) {
            if ($.isArray(obj[key]) && thisFun.isEmpty(obj[key])) {
                delete obj[key];
            }
        }
    };
    $(obj).closest('form').find('[name]').each(function () {                                                           //遍历表格所有带有name的元素
        var $this = $(this);
        thisName = $.trim($this.attr('name'));
        thisVal = '';
        //判断是否为checkbox
        if ($(this).is(':checkbox')) {
            if ($(this).is(":checked")) {
                thisVal = $.trim($this.val());
            }
        } else { 
            thisVal = $.trim($this.val());
        }
        nameGroup = $this.data('name-group');                                                                           //用来判断分组
        filterEmpty = $this.attr('filter-empty');                                                                       //用来判断input传入数据非空是否过滤
        prefix = $this.data('prefix');
        if (!!prefix && !!thisVal) {                                                                                    //当页面直接回车查询数据，不会出发blur，直接回填数据，并且用prefix去除数据
            var $reg = "/^" + prefix + "(.+)/";
            $reg = eval($reg);
            var $result = thisVal.match($reg);
            if (!!$result && !!$result[1]) {
                $this.val($result[1]);
                thisVal = $result[1];
            }
            thisVal = prefix + thisVal;                                                                              　  //当输入框input[data-prefix]前缀存在，则添加到value里面
        }
        if (thisVal.length > 0 || filterEmpty === "no") {                                                               //当数值存在，或者不进行非空过滤时候进行处理。不然就丢弃
            var typeObj = thisFun.groupType(thisName, nameGroup);
            thisName = typeObj.realName;
            if (typeObj.group) {                                                                                        //判断是否有data-name-group属性，有则分组
                thisFun.emptyCreate(args, nameGroup, "array");
                thisFun.arrObjCheckInsert(args[nameGroup], thisName, typeObj.nameArr);
            } else {                                                                                                    //没有分组
                for (var key in args) {                                                                                 //检测分组名和name是否冲突
                    if (key == thisName) {
                        alert("name冲突");
                        return false;
                    }
                }
                if (!!typeObj.nameArr) {                                                                                //判断是否是name[index]情况
                    thisFun.arrCheckInsert(args, index);
                } else {
                    args[thisName] = thisVal;
                }
            }
        }
    });
    thisFun.clearEmptyGroup(args);                                                                                      //用来删除空的分组
    return args;
}

/**
 *  作者 : liubibo
 *  用途 : 用于左侧栏left-frame收起和展开
 */
function closeTab(e) {
    var events = window.event || e;
    var $this = $(this);
    var status = e.data;
    //events.stopPropagation();
    if (!$this.hasClass('jsIsClosed')) {
        $('.left-frame').addClass('jsIsClosed').removeClass('jsIsOpened');
        $('.right-frame, .breadcrumb-wrapper').addClass('jsIsClosed').removeClass('jsIsOpened');
        $this.addClass('jsIsClosed').removeClass('jsIsOpened');
    } else {
        $('.left-frame').removeClass('jsIsClosed').addClass('jsIsOpened');
        $('.right-frame, .breadcrumb-wrapper').removeClass('jsIsClosed').addClass('jsIsOpened');
        $this.removeClass('jsIsClosed').addClass('jsIsOpened');
    }
}
$('.jsCloseTab').on('mouseenter', closeTab).on('mouseleave', closeTab);

/**
 * 描述 : 用于弹出层的按钮，自动关闭的功能
 * 作者 : liubibo
 */
function layoutFun(callBack, windowObj, callBackObj) {
    setTimeout(function () {
        oDialogDiv.dialogClose(callBackObj.handle);
    }, 1000);
}
/**
 * 描述 : 当弹出框高度有变化的时候，由于iframe不会随之变化，解决iframe高度随之变化的问题。
 * 作者 : liubibo
 */
function resizeIframe(target) {
    var newHeight = !target ? $(window).height() : $(target).height();
    var treeNodes = L.open('oDialogDiv').getTreeNode();
    var thisODiaglog;
    if (!treeNodes) {
        return false;
    }
    thisODiaglog = treeNodes[treeNodes.length - 1].oDialogDivObj.get(0);
    if (!!thisODiaglog) {
        $(thisODiaglog).find('.content').find('iframe').height(newHeight);
    }
}
/**
 * 描述 : 将输入框的value给trim，如果包含val-format= dollarTOCent则进行单位元转分
 * 参数 : 如果是filter是true，则表示如果当前页面没有数据，则直接返回null；
 * 作者 : liubibo
 */
function modifyVal(obj, filter) {
    var dataType, $firstObj, $objVal, storeVal;
    if (typeof obj !== "object" && obj !== undefined) {                                                                 //检测如果不是js对象或者jq对象，就当传过来的是数值处理。
        $objVal = $.trim(obj);
        storeVal = $objVal;
    } else if (obj === undefined) {
        if (filter === "true") {
            storeVal = null;
        } else {
            storeVal = "";
        }
    } else {
        $firstObj = $(obj).eq(0);
        $objVal = $.trim($firstObj.val());
        dataType = typeof $objVal;
        if ($firstObj.attr('val-format') === "dollarToCent") {
            if ($objVal !== "") {
                storeVal = ( parseFloat($objVal) * 100 ).toFixed(0);
            } else {
                storeVal = "";
            }
        } else {
            storeVal = $objVal;
        }
        if (dataType !== typeof storeVal) {                                                                             //用来转换回原来的数据类型
            if (dataType === "string") {
                storeVal = storeVal.toString();
            } else if (dataType === "number") {
                storeVal = parseFloat(storeVal);
            }
        }
    }
    return storeVal;
}
$(function () {
    /**
     * 描述 : 判断问题信息部分哪行是需要解决的，将其标红。
     * 作者 : liubibo
     */
    var errorLists = $('#orderError').find('.jsorderError');
    var exceptionLists = errorLists.filter('[solve-class="exception"]');
    var complainLists = errorLists.filter('[solve-class="complain"]');
    var needSolveHighLight = function (obj) {                                                                           //分类exception和complain，倒序遍历页面的的每行数据，是否为mode不是false或者""，不是则标红
        var thisLists = obj;
        if (thisLists.length > 0) {
            for (var i = thisLists.length - 1; i >= 0; i--) {
                if (thisLists.eq(i).find('[name="mode"]').val() === "false" || !thisLists.eq(i).find('[name="mode"]').val()) {
                    return false;                                                                                       //倒序遍历，知道mode为false或者“”，则停止遍历，证明从此往上的数据都是已经解决过的，不需要解决了
                } else {
                    thisLists.eq(i).addClass('bg-danger');
                }
            }
        }
    };
    needSolveHighLight(exceptionLists);
    needSolveHighLight(complainLists);
    /**
     //* 描述 : 用于监听新增问题信息选择类型时候，给该行tr加数据，由于数据问题
     * 作者 : liubibo
     */
    $('#orderError').on('blur', '.jsNewRow [name="orderState"]', function () {
        var thisVal = $(this).val();
        $(this).closest('tr').attr('solve-class', thisVal);
    });
    /**
     * 开启关闭解决问题按钮
     */
    $('.jsSolveBtn').on('blur', function () {
        var $this = $(this);
        var solveKind = modifyVal($this.val());
        var checkNeedSolve = function (obj) {
            var errorLists = $(obj).closest('tbody').find('.jsorderError');
            var solveGoodsLists;
            var needSolve = 1;
            if (errorLists.length > 0) {                                                                                //查看对应的数据模块是有。
                solveGoodsLists = errorLists.filter('[solve-class="' + solveKind + '"]');
                if (solveGoodsLists.last().find('[name="mode"]').val() === "false" || !solveGoodsLists.last().find('[name="mode"]').val()) {                                              //需要处理的列表数据中，判断是否最后一个就是解决异常（mode=false || mode= ""）
                    alert('没有需要处理的' + (solveKind === "exception" ? "订单异常" : "订单投诉"));                                   //最后一个是解决异常，则非手动新增部分没有需要解决异常
                    needSolve = 0;
                }
            } else {
                alert('没有需要处理的' + (solveKind === "exception" ? "订单异常" : "订单投诉"));
                needSolve = 0;
            }
            return needSolve;
        };
        if (solveKind === "complain") {                                                                                 //当开启问题时候，问题备注关闭检测和填写,去掉检测报警时的黄色背景
            if (!checkNeedSolve($this.get(0))) {
                $this.val("").trigger('blur');
            } else {
                $(this).closest('tr').find('.jsSolveInfo').css("background-color", "")
                    .attr({
                        "tab-tip-target": "jsTipError",
                        "checkfor": "not_empty",
                        "alertfor": "填写解决备注",
                        "tab-tip-target": "jsTipError",
                        "disabled": false
                    }).focus();
            }
        } else if (solveKind === "exception") {                                                                         //当关闭问题时候，聚焦问题备注，并且开启强制填写功能
            if (!checkNeedSolve($this.get(0))) {
                $this.val("").trigger('blur');
            } else {
                $(this).closest('tr').find('.jsSolveInfo').css("background-color", "")
                    .attr({
                        "checkfor": "not_empty",
                        "alertfor": "填写解决备注",
                        "tab-tip-target": "jsTipError",
                        "disabled": false
                    }).focus();
            }
        } else if (solveKind === "") {                                                                                  //当选则为空，则将填写备注给关闭，关闭检测
            $(this).closest('tr').find('.jsSolveInfo')
                .css("background-color", "")
                .attr({
                    "disabled": true,
                    "placeholder": ""
                })
                .removeAttr('checkfor').removeAttr('alertfor');
        }
    });
    listenEnter({'submitBtn': '.jsSearchBtn'});                                                                         //监听搜索按钮下的回车
    $('.wDateInput').length > 0 &&
    $('.wDateInput').each(function () {                                                                                 //需要dom结构加载完才能调用时间插件
        window.L.open('wDate', {
            'obj': this,                                                                                                //需绑定的对象
            'eventType': 'focus',                                                                                       //绑定的触发事件,默认click
            'params': {'readOnly': true, 'dateFmt': 'yyyy-MM-dd HH:mm:ss'}                                              //传递WdatePicker的参数
        });
    });
    $('.wDateInputSearch').length > 0 &&
    $('.wDateInputSearch').each(function () {                                                                           //需要dom结构加载完才能调用时间插件
        window.L.open('wDate', {
            'obj': this,                                                                                                //需绑定的对象
            'eventType': 'focus',                                                                                       //绑定的触发事件,默认click
            'params': {'readOnly': true, 'dateFmt': 'yyyy-MM-dd'}                                                       //传递WdatePicker的参数
        });
    });
});
/**
 * 描述 : 用于设置附加数据等部分隐藏和查看
 * 作者 : liubibo
 */
$('.jsHideInfo').on('click', '.jsHideBtn,.hideInfo', function () {
    if ($('.jsHideInfo').hasClass('showAll')) {
        $('.jsHideInfo').removeClass('showAll');
    } else {
        $('.jsHideInfo').addClass('showAll');
    }
});
/**
 * 描述 : 用于接收后台传过来的权限数组（没有的权限展示），之后进行对应的锁定或者隐藏
 * 选项: 当前元素添加class为jsAuthHide实现强制隐藏
 *              添加jsAuthDisabled强制锁定
 * 样例:
 *  var userInfo2 = {
 *      "deny": {
 *          "pack": {
 *              "admin": {
 *                  "data": "",
 *                  "func": {
 *                      "show_order::setGlobalOrder@trueRefund": "show_order::setGlobalOrder@trueRefund",
 *                      "show_order::setGlobalOrder@falseRefund": "show_order::setGlobalOrder@falseRefund",
 *                      "show_order::setCancel@delZero": "show_order::setCancel@delZero",
 *                      "show_chunk::index": "show_chunk::index",
 *                   }
 *               }
 *          }
 *      }
 *  };
 */
function checkAuthorize(checkObj) {
    var userRole,
        thisFun = arguments.callee,
        $this,
        _this,
        kinds,
        canHide,
        canDisabled,
        kindsObj,
        tagName,
        authorize,
        denyInfo,
        kindResult,
        $parentArr = [],
        $childArr = [],
        $checkObj = $(checkObj),
        _checkObj = $checkObj.get(0),
        $subObj;
    if (!$('#userRole').val()) {
        return false;
    }
    userRole = JSON.parse($('#userRole').val());
    denyInfo = userRole.deny.func;
    /**
     * 描述 : 用于检测传入权限数组（authorizeObj）和需要找寻的权限数组（kindsObj），返回对应的数据，false代表需要disabled；null表示可能需要隐藏，true表示正常展示
     * 作者 : liubibo
     */
    thisFun.authorizeResult = function (authorizeObj, kindsObj) {
        var tempCon = kindsObj.controller ? kindsObj.controller : "";
        var tempFunc = kindsObj.func ? "::" + kindsObj.func : "";
        var tempSub = kindsObj.sub ? '@' + kindsObj.sub : "";
        if (!kindsObj.controller || kindsObj.controller === "") {
            throw "没有写控制器";
        } else if (!kindsObj.func || kindsObj.func === "") {
            if (!!denyInfo && !!denyInfo[tempCon]) {
                return null;
            } else {
                return true;
            }
        } else if (!kindsObj.sub || kindsObj.sub === "") {
            if (!!denyInfo) {
                if (!!denyInfo[tempCon + tempFunc]) {
                    return null;
                } else if (!!denyInfo[tempCon + tempFunc]) {
                    return null;
                } else {
                    return true;
                }
            }
        } else {
            if (!!denyInfo) {
                if (!!denyInfo[tempCon]) {
                    return null;
                } else if (!!denyInfo[tempCon + tempFunc]) {
                    return null;
                } else if (!!denyInfo[tempCon + tempFunc + tempSub]) {
                    return false;
                }
            }
        }
        return true;
    };
    /**
     * 描述 : 用于处理传入的对应数据处理，auth为true false(初步判断为锁定输入)  null（初步判定为隐藏），检测当前是否有class为jsAuthHide（隐藏）和jsAuthDisabled（锁定），有则根据class来处理
     *      没有则按初步判断的结果处理。
     *      当隐藏，系统自动该元素添加jsAuthCloak和jsAuthDenied样式
     *      当锁定，系统自动该元素添加jsAuthLock和jsAuthDenied 样式
     * 作者 : liubibo
     */
    thisFun.handleType = function (obj, auth) {
        var thisObj = $(obj);
        var thisTagName = obj.tagName;
        var thisCanHide = thisObj.hasClass('jsAuthHide');
        var thisCanDisabled = thisObj.hasClass('jsAuthDisabled');
        if ((thisTagName === "OPTION" || thisTagName === "A") && thisCanDisabled) {                                     //当自身是option或者是a，开启的是disabled功能，会失效，进行报错处理
            throw "当前为option或者a，不能用disabled限制，只能隐藏，请删除class=jsAuthDisabled";
        }
        if (auth === false) {
            if (!!canHide || thisTagName === "OPTION" || thisTagName === "A") {
                thisObj.css('display', 'none');
                thisObj.addClass('jsAuthCloak');
            } else {
                thisObj.attr({"disabled": "disabled", "readonly": "readonly"})
                    .css({"background-color": "#eee", "opacity": 1, "cursor": "not-allowed"});
                thisObj.addClass('jsAuthLock');
            }
        } else if (auth === null) {
            if (!!canDisabled) {
                thisObj.attr({"disabled": "disabled", "readonly": "readonly"})
                    .css({"background-color": "#eee", "opacity": 1, "cursor": "not-allowed"});
                thisObj.addClass('jsAuthLock');
            } else {
                thisObj.css('display', 'none');
                thisObj.addClass('jsAuthCloak');
            }
        }
        thisObj.addClass('jsAuthDenied');
    };
    /**
     * 描述 : 根据字符串进行处理，返回对象{"controller":"..", "func":"...","sub":"..."},
     *   controller用于检测控制器的权限，没有则直接隐藏或者disabled。
     *   再进一步找寻下自身的权限，没有则直接隐藏或者disabled。
     * 作者 : liubibo
     */
    thisFun.kindsToObj = function (str) {
        if (!str) {
            return false;
        }
        var regex = /^(.*?)\:\:(.*?)(?:@(.*?))?$/;                                                                      //匹配该种kinds （fewf > fes ），父级($1)和子级别($2)关系
        var result = str.match(regex);
        var kindsObj = {controller: '', func: "", sub: ""};
        if (!!result && result[2] !== undefined) {
            kindsObj.controller = result[1];
            kindsObj.func = result[2];
            if (result[3] !== undefined) {
                kindsObj.sub = result[3];
            }
        }
        return kindsObj;
    };
    /**
     * 描述 : 如果本身不是输入框，可能是一块div，而且不会隐藏情况下，则进行子输入框检测，返回true，表明子输入框本身没有检测权限。 返回false,表明子输入框本身有权限检测
     * 作者 : liubibo
     */
    thisFun.checkSubInputs = function (obj, parentHide) {
        var thisKind = $.trim($(obj).attr('authorize-kind'));
        if (!!thisKind && !parentHide) {
            return false;
        }
        return true;
    };
    /**
     * 描述 : 用于判断当前类型是否是返回child， 或者返回auhorize为true 或者false
     * 作者 : liubibo
     */
    thisFun.multiKinds = function (str) {
        var tempArr;
        if (!str) {                                                                                                     //当前元素没有authorize-kind，返回child
            return 'child';
        }
        if (str.indexOf("||") > 0) {
            tempArr = str.split("||");
            tempArr.some(function (item, index, array) {
                kindsObj = thisFun.kindsToObj(item);
                return authorize = thisFun.authorizeResult(denyInfo, kindsObj);
            });
        } else if (str.indexOf('&&') > 0) {
            tempArr = str.split("&&");
            tempArr.every(function (item, index, array) {
                kindsObj = thisFun.kindsToObj(item);
                return authorize = thisFun.authorizeResult(denyInfo, kindsObj);
            });
        } else {
            kindsObj = thisFun.kindsToObj(str);
            authorize = thisFun.authorizeResult(denyInfo, kindsObj);
        }
        return authorize;
    };
    /**
     * 原因 : 由于authorize-kind和另一个authorize-kind 有一个重合的元素（如input[authorzie-kind="none"]），无法准确判断属于哪一个，用于解决此问题
     * 机制 : 当前元素有authorize-kind的时候，保存结果到 该元素的data-authorize中。其结果有 true ,false, child。如果是child的话，auhorize会取最近父级的data-authorize的结果
     * 参数 : obj为当前元素，isAuth为返回情况
     * 作者 : liubibo
     */
    thisFun.markAuthrize = function (obj, isAuth) {
        if (isAuth === true) {
            $(obj).attr('authorize', true);
        } else if (isAuth === false) {
            $(obj).attr('authorize', false);
        } else if (isAuth === 'child') {
            //暂时不做任何处理
        } else if (isAuth === null) {
            $(obj).attr('authorize', null);
        }
    };
    /**
     * 描述 : 收集有authorize-kind且内含元素的数组
     * 作者 : liubibo
     */
    thisFun.parentArr = function (obj) {
        var temp = $(obj);
        $parentArr.push(temp);
    };
    /**
     * 描述 : 收集authorize-kind的内包含的元素数组
     * 作者 : liubibo
     */
    thisFun.childArr = function (obj) {
        $.each($parentArr, function (i, t) {
            $childArr.push(t.find('select,input,textarea,button').not('[authorize]'));
        });
    };
    /**
     * 描述 : 用于处理authorize-kind子元素数组（不包含authorize-kind),找子元素父级的authorize是“false”，则锁定该子元素
     * 作者 : liubibo
     */
    thisFun.handleChild = function ($arr) {
        if (!!$arr && $arr.length > 0) {
            $.each($arr, function (i, t) {
                var parentAuth = t.closest('[authorize]');
                if (parentAuth.attr('authorize') === "false") {
                    thisFun.handleType(this, false);
                }
            });
        }
    };
    /**
     * 描述 : 主函数
     * 作者 : liubibo
     */
    thisFun.checkObjFun = function (obj) {
        $this = $(obj);
        _this = obj;
        tagName = _this.tagName;
        kinds = $.trim($this.attr('authorize-kind'));
        canHide = $this.hasClass('jsAuthHide');
        canDisabled = $this.hasClass('jsAuthDisabled');
        kindResult = thisFun.multiKinds(kinds);
        thisFun.markAuthrize(_this, kindResult);
        if (!!canHide && !!canDisabled) {
            throw "不能同时锁定和隐藏，选择删除jsAuthHide或者jsAuthDisabled";
        }
        if ((tagName === "OPTION" || tagName === "A") && canDisabled) {                                                 //当自身是option或者是a，开启的是disabled功能，会失效，进行报错处理
            throw "当前为option或者a，不能用disabled限制，只能隐藏，请添加class=jsAuthHide";
            return false;
        }
        if (!authorize) {                                                                                               //当没有权限时候，判断当前对象输入框之类的，直接进行处理
            var typeArr = ["SELECT", "INPUT", "TEXTAREA", "BUTTON", "OPTION", "A"];
            var isBlock = 1;
            $.each(typeArr, function (ind, item) {
                if (item === tagName) {
                    thisFun.markAuthrize(_this, kindResult);                                                            //当前input没有authorize-kind，以此寻找最近有authorize-kind的父级
                    thisFun.handleType(_this, authorize);
                    isBlock = 0;
                    return false;
                }
            });
            if (isBlock === 1) {                                                                                        //当可能是div这种块状的，检测是否隐藏。隐藏直接隐藏该块。
                if (!!canHide || (authorize === null && !canDisabled)) {
                    thisFun.handleType(_this, authorize);
                } else {                                                                                                //不是隐藏，则进行进行锁定各个子输入框的功能。
                    thisFun.parentArr(_this);
                }
            }
        }
    };

    /**
     * 描述 : 根据块状的authorize-kind，遍历块状(div或者别的块标签)中的输入框（不带authorize-kind），再遍历整个区域中输入框attr是authorize-kind元素，进行处理。
     * 作者 : liubibo
     */
    if (!!$checkObj.attr('authorize-kind')) {
        thisFun.checkObjFun(_checkObj);
    }
    $subObj = $checkObj.find('[authorize-kind]');
    if ($subObj.length > 0) {
        $subObj.each(function (ind, item) {
            if (!!$(this).attr('authorize-kind').trim()) {
                thisFun.checkObjFun(item);
            }
        });
    }
    thisFun.childArr($parentArr);
    thisFun.handleChild($childArr);
}
/**
 * 描述 : 用于判断订单的状态，之后锁定页面编辑操作按钮输入框等，同时添加class(orderStateLocked);
 * 参数 :
 *      obj : 传入对象，一般抓取页面的[order-state-lock]属性的元素，
 *            属性对应值为 页面(chunk)-条件(logistics-code)（chunk-logistics-code ）
 * 作者 : liubibo
 */
function orderStateLock(obj) {
    var thisFun = arguments.callee;
    /**
     * 描述 : 用于判断订单的状态，之后锁定页面编辑操作按钮输入框等，同时添加class(orderStateLocked);
     * 参数 :
     *      object : 如果为字符或者DOM对象，直接进行锁定
     *              如果为对象，object为对应对象，checkfor为是否关闭校检页面，text为是否添加文字信息
     *            属性对应值为 页面(chunk)-条件(logistics-code)（chunk-logistics-code ）
     * 作者 : liubibo
     */
    thisFun.lockEdit = function (object) {
        if (typeof object === "string") {
            $(object).prop('readonly', 'readonly').addClass('orderStateLocked');
            return true;
        } else if (object.constructor.name === "Object") {
            if (object.nodeType === 1) {
                $(object).prop('readonly', 'readonly').addClass('orderStateLocked');
                return true;
            } else {
                var def = {
                    object: object,
                    checkfor: false,
                    text: "",
                    hide: false,
                    disabled: true,
                    readonly: false
                };
                var $obj;
                $.extend(true, def, object);
                $obj = $(def.object);
                if ($obj.length > 0) {
                    $obj.addClass('orderStateLocked');
                } else {
                    console.error("订单状态锁定功能,对象%s ,没有找到", def.object);
                    return false;
                }
                if (def.disabled) {
                    $obj.prop('readonly', 'readonly');
                }
                if (def.readonly) {
                    $obj.prop('readonly', 'readonly');
                }
                if (def.checkfor) {
                    $obj.each(function () {
                        $(this).removeClass('.jsCheckEdit').removeAttr('checkfor');
                    });
                }
                if (def.text) {
                    var text;
                    if (typeof def.text === "boolean") {
                        text = "该订单状态不能编辑"
                    } else {
                        text = def.text;
                    }
                    if ($obj.get(0).tagName == "input" || $obj.get(0).tagName == "textarea") {
                        $obj.val(text);
                    } else {
                        $obj.text(text);
                    }
                }
            }
        }
    };
    /**
     * 描述 : 用于汇总详情setOrginalOrde和ebay查询详情ebayOrder以及问题订单的条件判断
     * 参数 :
     *      object : 如果为字符或者DOM对象，直接进行锁定
     *      condition : 不同情况下判断条件
     *      isHide : 当前元素是否有jsOrderStateHide的class
     * 作者 : liubibo
     */
    thisFun.original = function (object, condition, isHide) {
        var $this = $(object);
        if (condition == "basic") {
            if (typeof allObj.data != "undefined" && allObj.data.orderState >= 30) {
                thisFun.lockEdit({object: object, hide: isHide});
            }
        } else if (condition == "buyer-info") {
            if (typeof allObj.data != "undefined" && allObj.data.orderState >= 110) {
                thisFun.lockEdit({object: object, hide: isHide});
            }
        } else if (condition == "chunk") {
            if (typeof allObj.data != "undefined" && (allObj.data.orderState >= 90 ||
                allObj.data.orderState < 30 )) {
                thisFun.lockEdit({object: object, hide: isHide});
            }
        } else if (condition == "order-number") {
            var globalOrder = allObj.order.globalOrder;
            if (!!globalOrder) {
                thisFun.lockEdit({object: object, hide: isHide});
            }
        } else {
            return -2;
        }
    };
    /**
     * 描述 : 用于分仓详情chunkOrde的条件判断
     * 参数 :
     *      object : 如果为字符或者DOM对象，直接进行锁定
     *      condition : 不同情况下判断条件
     *      isHide : 当前元素是否有jsOrderStateHide的class
     * 作者 : liubibo
     */
    thisFun.chunk = function (object, condition, isHide) {
        var $this = $(object);
        if (condition == "basic") {
            if (typeof allObj.data != "undefined" && allObj.data.chunkState >= 60) {
                thisFun.lockEdit({object: object, hide: isHide});
            }
        } else if (condition == "logistics-code") {
            if (typeof allObj.data != "undefined" && allObj.data.chunkState < 80) {
                thisFun.lockEdit({object: object, checkfor: false, hide: isHide});
            }
        } else if (condition == "goods-list") {
            if (typeof allObj.data != "undefined" && allObj.data.chunkState >= 60) {
                thisFun.lockEdit({object: object, hide: isHide});
            }
        } else if (condition == "set-sign") {
            if (typeof allObj.data != "undefined" && allObj.data.chunkState < 80 ||
                allObj.data.signedTime === undefined) {
                thisFun.lockEdit({object: object, text: "不能设置妥投", hide: isHide});
            } else if (new Date(allObj.data.signedTime) > new Date("2000-01-01 00:00:00")) {
                thisFun.lockEdit({object: object, text: "已经妥投", hide: isHide});
            }
        } else if ( condition == 'basic2' ){                                                                            //分仓详情订单状态控制
            if (typeof allObj.data != "undefined" && allObj.data.chunkState > 60 && allObj.data.incompleteMode === false) {//incompleteMode信息缺失分组关闭
                thisFun.lockEdit({object: object, hide: isHide});
            }
        } else {
            return -2;
        }
    };
    /**
     * 描述 : 用于判断当前类型是否是返回child， 或者返回auhorize为true 或者false
     * 作者 : liubibo
     */
    thisFun.multiStates = function (str) {
        var tempArr = [];
        if (!str) {
            return tempArr;
        }
        if (str.indexOf("||") > 0) {
            tempArr = str.split("||");
        } else {
            tempArr.push(str);
        }
        return tempArr;
    };
    $(obj).each(function () {
        var $this = $(this);
        var state = $this.attr('order-state-lock');
        var isHide = $this.hasClass('.jsOrderStateHide') ? true : false;
        var multiStates = thisFun.multiStates(state);
        $.each(multiStates, function (i, t) {
            var regex = /(\s*.*?)-([\w-]*)\s*/;
            var result = t.match(regex);
            if (!!result) {
                var area = result[1];
                var condition = result[2];
                var exeResult = !!thisFun[area] ? thisFun[area]($this.get(0), condition, isHide) : -1;                    //执行结果不成功则进行后台报错。
                if (exeResult === -1) {
                    console.error("订单状态锁定功能,对象%o ,没有找到对应锁定状态的条件%s.", $this.get(0), state);
                } else if (exeResult === -2) {
                    console.error("订单状态锁定功能,对象%o ,没有找到对应锁定状态的函数%s.", $this.get(0), state);
                }
            } else {
                console.error("订单状态锁定功能,对象%o ,对应的判断条件填写错误%s.", $this.get(0), state);
            }
        });
    });
}
/**
 * 描述 : 自动分配价格处理
 * 作者 : hwj
 */
function priceHandle(goodsList, time, tirggerObj) {
    if (typeof goodsList === 'object' && !!allObj['order']['sourceAmount']) {
        var skuObj = {};
        var temp = {};
        var data = {};
        var sourceAmount = parseFloat(allObj['order']['sourceAmount']).toFixed(5) ;                                           //商品总价(支付币种)
        if (goodsList.length > 0) {
            skuObj.sourceAmount = sourceAmount;
            skuObj.totalCost = 0;                                                                                             //商品列表总成本
            goodsList.each(function () {                                                                                      //收集goodsList数据
                var currentSku = String($(this).find('.jsTrimSKU').val());
                var num = parseInt(String($(this).find('[name="quantity"]').val()));
                var thisCost = 0;
                if (currentSku != '' && num > 0) {
                    thisCost = parseFloat(String($(this).find('[name="sourceCost"]').val()));                                 //成本(人民币)
                    if (thisCost < 0 || thisCost == 0) {                                                                      //如果成本小于等于0默认为10人民币
                        thisCost = 10;
                    }
                    temp.cost = thisCost;
                    temp.totalCost = (thisCost * num).toFixed(5);                                                             //单价*数量
                    temp.num = num;
                    temp.sku = currentSku;
                    data[currentSku] = temp;
                    skuObj.totalCost = (parseFloat(skuObj.totalCost) + parseFloat(temp.totalCost)).toFixed(5);                //产品列表总成本
                    temp = {};
                }
            });
            skuObj.data = data;
            if (!!skuObj.data) {                                                                                              //根据 (成本/总成本) 比例计算售价
                skuObj.totalPrice = 0;
                var errorRate = sourceAmount;
                for (var sku in skuObj.data) {
                    var totalCost = parseFloat(skuObj.data[sku]['totalCost']);
                    var num = parseInt(skuObj.data[sku]['num']);
                    var total = parseFloat(skuObj.totalCost);
                    var ratio = (totalCost / total).toFixed(5);                                                               //基于成本的比例
                    var price = sourceAmount * ratio;
                    skuObj.data[sku]['ratio'] = ratio;
                    skuObj.totalPrice = (parseFloat(skuObj.totalPrice) + price).toFixed(5);                                   //商品总售价;
                    price = (price / num).toFixed(2);
                    errorRate = (errorRate - (price*num)).toFixed(5);
                    skuObj.data[sku]['price'] = price;                                                                        //订单总价不变，根据比例分配售价(支付币种)
                }
                allObj['order']['errorRate'] = Math.abs(errorRate);                                                           //系统自动分配产生的误差

                if (String(tirggerObj.attr('name')) !== "sourcePrice") {
                    var flag = false;
                    goodsList.each(function () {                                                                              //自动分配商品列表售价(订单总额不变)
                        var currentSku = String($(this).find('.jsTrimSKU').val());
                        var num = parseInt(String($(this).find('[name="quantity"]').val()));
                        if (currentSku != '' && num > 0) {
                            var price = skuObj.data[currentSku]['price'];
                            $(this).find('[name="sourcePrice"]').val(price);
                            flag = true;
                        }
                    });
                    if (flag === true && time>0) {window.L.open('tip')("自动分配单价完成", time)};
                }
            }
        }
    }
}
/**
 * 描述 : 当输入sku输入框时候，弹出对应数据，数据来源后台，并且离开输入框之后填充对应输入框数据。
 * 调用方法 : showHint为调用下拉弹出框，fillInfo为自动填充数据和对应的ajax key和页面上的name值
 * 例子 : var links = {"showHint": url,"fillInfo": url,"targetArray":{ajax key:"[name='target name']","ajax key2":"[name='target name2']"}};
 *       $('#sku').on('keyup paste', '', links, showFill).on('blur.fill', '', links, showFill);
 * 作者 : liubibo
 */
function showFill(e) {
    var $this = $(this),
        _this = this,
        thisFun = arguments.callee,
        hasTipShow,
        $eData = e.data;
    /**
     * 描述 : 根据传过来的数组进行填充数据并生成列表的html
     * 作者 : liubibo
     */
    thisFun.hintHtml = function (tipInfo) {
        var tipShow = false;
        if (!!tipInfo) {
            tipShow = $('.tipShow');
            if (!tipShow || tipShow.length === 0) {
                tipShow = $('<div class="tipShow positionA"></div>');
            } else {
                tipShow.empty();
            }
            $.each(tipInfo, function (i, t) {
                var tipOption = $('<div class="tipOption"></div>');
                tipShow.prepend(tipOption.text(t));
            });
            $('body').append(tipShow);                                                                                  //将弹出框放到页面
            hasTipShow = true;
        }
        return tipShow;
    };
    /**
     * 描述 : 提示列表的定位
     * 作者 : liubibo
     */
    thisFun.positionTip = function (obj, tip) {
        var $this = $(obj);
        var $tip = $(tip);
        var top = $this.offset().top;
        var left = $this.offset().left;
        var tipHeight;
        $thisHeight = $this.outerHeight();
        top = parseInt(top) + parseInt($thisHeight);                                                                    //让弹出框显示在输入框上面
        $tip.css({'top': top, "left": left});
    };
    /**
     * 描述 : 触发后台，获取弹出列表的数组
     * 参数 :
     *      url : 请求地址
     *      object : 用于ajax成功失败之后回调函数的参数
     *      callBack : 用于ajax成功失败之后回调函数
     * 作者 : liubibo
     */
    thisFun.tipArray = function (url, sku, object, callBack) {
        sku = encodeURIComponent(sku);
        url = url + sku;
        $.ajax({
            url: url,
            type: 'GET',
            dataType: "JSON",
            success: function (data) {
                callBack(data, object);                                                                                 //当从后台获取之后，回掉函数建立html，弹出提示框
            }, error: function () {
                callBack("", object);                                                                                   //当后台没有数据，也需要回掉，第一个函数为空。
            }
        });
    };
    /**
     * 描述 : 用于移除当前对象列表
     * 作者 : liubibo
     */
    thisFun.destroyTip = function (obj) {
        $(obj).remove();
        hasTipShow = false;
    };
    /**
     * 描述 : 支持上下左右的选择列表，返回true，或者false，false则继续进行后续函数，如建立提示框
     * 作者 : liubibo
     */
    thisFun.chooseHint = function (e, object) {
        if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40 || e.keyCode === 9) {          //如果按键是上(38)下(40)左(39)右(37)，进行选择操作并且返回true， tab(9)则不选择，当时也返回true
            if (!!hasTipShow || $('.tipShow').length > 0) {
                e.preventDefault();
                var tipOption = $('.tipShow').find('.tipOption');
                var tipLength = tipOption.length;
                var isSelected = -1;
                var upOrDown;
                var whichSelect = 0;
                if (e.keyCode === 38 || e.keyCode === 39) {
                    upOrDown = -1;
                } else if (e.keyCode === 37 || e.keyCode === 40) {
                    upOrDown = 1;
                }
                tipOption.each(function (i, t) {
                    if ($(this).hasClass('hover')) {
                        isSelected = i;
                    }
                });
                if (isSelected !== -1) {
                    if ((isSelected + upOrDown) === -1) {
                        whichSelect = tipLength - 1;
                    } else if ((isSelected + upOrDown) === tipLength) {
                        whichSelect = 0;
                    } else {
                        whichSelect = isSelected + upOrDown;
                    }
                } else {
                    if (upOrDown === -1) {
                        whichSelect = tipLength - 1;
                    } else {
                        whichSelect = 0;
                    }
                }
                tipOption.eq(whichSelect).addClass('hover').siblings().removeClass('hover');                            //弹出框选项选择之后，添加hover的class，和对应的数据填充到输入框
                var reg = /^(?:([a-zA-Z]+)\_)?([A-Za-z]+?[0-9]+)(?:\_([a-zA-Z]+))?(?:\s+X\s+(\d+))?$/;                  //用于添加前缀或者后缀
                var result = $(object).val().match(reg);
                if (!!result[1]) {                                                                                      //添加前缀
                    $(object).val(result[1] + '_' + tipOption.eq(whichSelect).text());
                } else if (!!result[3]) {                                                                               //添加后缀
                    $(object).val(tipOption.eq(whichSelect).text() + '_' + result[3]);
                } else {
                    var quantity = result ? result[4] : "";
                    $(object).val(tipOption.eq(whichSelect).text() + quantity);
                }
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };
    /**
     * 描述 : 当选择列表的时候，暂时关闭blur功能
     * 作者 : liubibo
     */
    thisFun.switchBlur = function (tipObj, switchObj) {
        var $switchObj = $(switchObj);
        $(tipObj).on('click', '.tipOption', function () {                                                               //弹出sku列表中的选项，点击
            var reg = /^(?:([a-zA-Z]+)\_)?([A-Za-z]+?[0-9]+)(?:\_([a-zA-Z]+))?(?:\s+X\s+(\d+))?$/;                      //添加前缀或者后缀
            var result = $switchObj.val().match(reg);
            if (!!result[1]) {                                                                                          //前缀
                $switchObj.val(result[1] + '_' + $(this).text());
            } else if (!!result[3]) {
                $switchObj.val($(this).text() + '_' + result[3]);
            } else {
                $switchObj.val($(this).text());
            }
            $switchObj.removeClass('hover');
            thisFun.destroyTip('.tipShow');                                                                             //删除sku弹出提示框
            $switchObj.focus();
            $switchObj.on("blur.fill", '', e.data, showFill);                                                           //重新绑定sku blur之后填充数据功能
        });
        $(tipObj).on('mouseenter', function () {                                                                        //当鼠标悬浮到弹出框的时候，需要临时关闭sku输入框blur的事件
            $switchObj.off("blur.fill");
            $switchObj.addClass('hover');
        }).on('mouseleave', function () {
            $switchObj.on("blur.fill", '', e.data, showFill);
            $switchObj.removeClass('hover');
        });
    };
    /**
     * 描述 : 获取当前页面的value值，如果存在，返回数据，否则返回false
     * 作者 : liubibo
     */
    thisFun.getVal = function (obj) {
        var $this = $(obj),
            $thisVal = $.trim($this.val()),
            $skuFilterPrefix;
        if (!!$thisVal) {
            var reg =
                /^(?:([a-zA-Z]+)\_)?([A-Za-z0-9]*(?:[A-Za-z]+?[0-9]+)[A-Za-z0-9]*)(?:\_([a-zA-Z]+))?(?:\s+X\s+(\d+))?$/;//判断前缀或者后缀
            var result = $thisVal.match(reg);
            var quantity = !!result && result[4] ? ' X ' + result[4] : "";
            $skuFilterPrefix = !!result ? result[2] + quantity : $thisVal;
            return $skuFilterPrefix;
        } else {
            return false;
        }
    };
    
    /**
     * 描述 : 获取当前页面的value值，如果存在，并且eData.prefix是need为需要前后缀，否则清空，delete为删除前后缀。
     * 作者 : liubibo
     */
    thisFun.checkSku = function (obj) {
        var $this = $(obj),
            $thisVal = $.trim($this.val().toUpperCase());
        if (!!$thisVal) {
            var reg = /(^[a-zA-Z]+\_)/;                                                                                 //判断前缀
            var result1 = $thisVal.match(reg);
            reg = /(\_[a-zA-Z]+)$/;                                                                                     //判断后缀
            var result2 = $thisVal.match(reg);
            if (!!result1 && !!result2) {
                L.open('tip')('商品sku不能同时有前缀(如:USA_)和后缀(如:_USA)', false);
                return "";
            } else {
                return $thisVal;
            }
        } else {
            return "";
        }
    };
    
    /**
     * 描述 : 用于填充当前数据。
     */
    thisFun.infoPut = function (object, infoArray, targetArray) {
        var area = !!$eData.targetArea ? $eData.targetArea : 'form';
        L.each(infoArray, function (i, t) {
            $(object).closest(area).find(targetArray[i]).val(t[i]);
        });
    };
    /**
     * 描述 : 主函数，用于输入时候显示提示列表。主函数调用子函数，子函数之间尽量不相互调用
     * 作者 : liubibo
     */
    thisFun.showHint = function (e, object) {
        var $thisVal = thisFun.getVal(object),
            $tipArray;
        $(object).attr('autocomplete', 'off');
        if (!$thisVal) {                                                                                                //如果输入内容后者是选择按钮功能，直接不执行下面
            $('.tipShow').remove();                                                                                     //移除弹出提示框
            return false;
        } else if (thisFun.chooseHint(e, object)) {                                                                     //当选择按钮之后，停止执行 上下左右箭头
            return false;
        }
        $tipArray = thisFun.tipArray(e.data.showHint, $thisVal, object, thisFun.showHintCallBack);                     //从后台获取数据数组
    };
    thisFun.showHintCallBack = function (tipArray, object) {
        if (!tipArray) {
            thisFun.destroyTip('.tipShow');                                                                             //删除tip(需要传对象)
        } else {
            var $returnArr = [];
            $.each(tipArray, function (i, t) {
                $returnArr.push(t);
            });
            $createdTipShow = thisFun.hintHtml($returnArr);                                                             //根据后台获取的数组，建立html提示框
            if ($createdTipShow) {
                thisFun.positionTip(object, $createdTipShow);                                                           //将提示框进行定位
                thisFun.switchBlur('.tipShow', object);                                                                 //添加监听时间，同时暂时关闭blur功能，之后再激活
            }
        }
    };
    thisFun.fillInfoCallBack = function (tipArray, object) {                                                            //向后台获取数组数据
        if (!tipArray) {
            window.L.open('tip')("自动获取SKU数据失败", 2000);
            return false;
        } else {                                                                                                        //根据后台获取的数据，和一个对象（包含后台数据和前台数据相对应的关系），进行填充数据
            window.L.open('tip')("自动获取SKU数据成功", 2000);
            thisFun.infoPut(object, tipArray, $eData.targetArray);
            var classStr = String($this.attr('class'));                                                                 //判断是否需要进行价格分配
            if (classStr.indexOf('jsPrice') > 0) {
                var goodsList = $this.closest('#goodsList').find('[name="pagingItem"]');
                var thisSku = $this.val();
                var thisNum = parseInt(String($this.closest('[name="pagingItem"]').find('[name="quantity"]').val()));
                if (thisSku != '' && thisNum > 0) {
                    priceHandle(goodsList, 0, $(this));
                }
            }
        }
    };
    /**
     * 描述 : 主函数用于填充sku相关信息。
     * 作者 : liubibo
     */
    thisFun.fillInfo = function (e, object) {
        var $thisVal,
            $tipArray;
        $thisVal = thisFun.getVal(object);
        if (!$thisVal) {
            return false;
        }
        $tipArray = thisFun.tipArray(e.data.fillInfo, $thisVal, object, thisFun.fillInfoCallBack);
    };
    if (!!e.data && !!e.data.showHint && (e.type === "keyup" || e.type === "paste" )) {
        $this.val($this.val().toUpperCase());
        thisFun.showHint(e, _this);
        $this.on('blur.destroy', function () {
            if (!$this.hasClass('hover')) {
                thisFun.destroyTip('.tipShow');                                                                         //如果存在提示框，删除sku弹出提示框
            }
        });
    } else if (!!e.data && !!e.data.fillInfo && (e.type === "blur" || e.type === "focusout" )) {
        $this.val($this.val().toUpperCase());
        if ($.trim($this.val()) !== $this.data('origin-value')) {
            var sku = thisFun.checkSku($this.get(0));
            if ($this.val() && !sku) {                                                                                  //不符合sku或者为空，重新聚焦
                $this.focus();
            }
            $this.val(sku);
            thisFun.fillInfo(e, _this);
        }
    }
}

/**
 * 描述 : 用与配合页面前缀部分。自动过滤前缀
 * 作者 : liubibo
 */
$('[data-prefix]').on('paste blur keyup', function () {
    var $prefix = $(this).data('prefix');
    var $reg = "/^" + $prefix + "(.+)/";
    var $thisVal = $(this).val().trim();
    $reg = eval($reg);
    var $result = $thisVal.match($reg);
    if (!!$result && !!$result[1]) {
        $(this).val($result[1]);
    }
});
/**
 * 描述 : 全选功能，area为所在区域（table），allSelect为全选按钮，followSelect为勾选框
 * 作者 : liubibo
 */
function allSelect(area, allSelect, followSelect) {
    $(area).on('click', allSelect, function () {
        var $this = $(this);
        var isCheck = $this.prop('checked');
        var $jsFollowSelects = $this.closest('table').find(followSelect);
        if (isCheck) {
            $jsFollowSelects.each(function () {
                if (!$(this).prop('checked')) {
                    $(this).prop('checked', true)
                }
            });
        } else {
            $jsFollowSelects.each(function () {
                if ($(this).prop('checked')) {
                    $(this).prop('checked', false)
                }
            });
        }
    });
    $(area).on('click', followSelect, function () {
        var $this = $(this);
        var isCheck = $this.prop('checked');
        var $jsFollowSelects = $this.closest('table').find(followSelect);
        var $allSelect = $this.closest('table').find(allSelect);
        var isAllCheck = true;
        if (isCheck) {
            $jsFollowSelects.each(function () {
                if (!$(this).prop('checked')) {
                    isAllCheck = false;
                }
            });
            if (isAllCheck) {
                $allSelect.prop('checked', true);
            }
        } else {
            if ($allSelect.prop('checked')) {
                $allSelect.prop('checked', false);
            }
        }
    });
}
/**
 * 描述 : 用于点击弹出框的保存按钮中callBack判断，1则直接调用弹出框iframe中的保存
 * 作者 : liubibo
 */
function saveFunction(callBack, windowObj, callBackObj) {
    var oDialogDiv = L.open('oDialogDiv');
    var thisFrame = oDialogDiv.getAncestorWindow()
        .document.getElementById("oDialogDiv_iframe_" + callBackObj.handle);
    var $thisFun = arguments.callee;
    /**
     *  描述 : 用于使用判断页面翻页是否翻页到底
     *  参数: pageBtn: "prev"或者"next"按钮
     *  作者 : liubibo
     */
    $thisFun.pageEnd = function (pageBtn, tableId) {
        var $loc = !!L.cookie().location ? L.cookie().location[tableId] : "";
        var $table = $('[name="pagingBlock"]').get(0);
        var itemNum, pageNum, size;
        var returnType = true;
        if (!!$table) {
            itemNum = !!$table.paging(null) ? $table.paging(null).items : "";
            pageNum = !!$table.paging(null) ? $table.paging(null).page : "";
            size = !!$table.paging(null) ? $table.paging(null).size : "";
            if (itemNum === "") {
                returnType = null;
            }
        } else {
            returnType = null;
        }
        if (pageBtn === "next") {
            if (parseInt(itemNum) - 1 < (parseInt($loc) + (pageNum - 1) * size + 1)) {
                returnType = false;
            }
        } else if (pageBtn === "prev") {
            if (0 > ( parseInt($loc) + (pageNum - 1) * size + -1)) {
                returnType = false;
            }
        }
        if (!returnType) {
            window.L.open('tip')('没有更多,不能翻页', 2000);
        }
        return returnType;
    };
    /**
     *  描述: 用于旗舰的翻页功能，修改当前页面的url中的额外的数据，根据turnPageNum加减后，找到分页中对应的数据，传递到后台
     *      从而进行翻译。
     *  参数:
     *      turnPageNum: "+1" 或者 "-1" 为上下页，如果是5（数字），为翻到对应页面。
     * 作者 : liubibo
     */
    $thisFun.ultraTurnPage = function (turnPageNum, argsObj) {
        var tableData = $('table[name="pagingBlock"]').get(0).data;
        var tWindow = callBackObj.oDialogDivObj;
        var currenctWin = tWindow.find('iframe').eq(0).get(0).contentWindow;
        var currenctDoc = currenctWin.document;
        var turnpageKey = JSON.parse(tWindow.find('.operating').find('.jsNextBtn').attr('extra-key'));
        var firstKey = turnpageKey.key[0];
        var currentHref = currenctWin.location.href;
        var id = $(currenctDoc).find('[name="' + firstKey + '"]').val();
        var noMore = false;
        var optionObj = {
            callBackFun: "",
            callBackArgs: ""
        };
        $.extend(optionObj, argsObj);
        var regex = new RegExp("(\\?|&)([ac]=[\\s\\S]*?)(?=&|$)", "ig");
        var search = currentHref.match(regex);
        search = search[0] + search[1];
        $.each(tableData, function (i, t) {
            if (t[firstKey] === id) {
                var reg = /[+-]\d+/;
                turnPageNum = turnPageNum.toString().match(reg) ? i + parseInt(turnPageNum) : parseInt(turnPageNum);    //传过来的页面中的需要
                if (turnPageNum >= 0 && turnPageNum < tableData.length) {
                    $.each(turnpageKey.key, function (ind, ite) {
                        // var regex = new RegExp("&(" + ite + "=[\\s\\S]*?)(?=&|$)", "i");
                        // currentHref = currentHref.replace(regex, "&" + ite + "=" + tableData[turnPageNum][ite]);
                        search += "&" + ite + "=" + tableData[turnPageNum][ite];
                    });
                    optionObj.callBackFun && optionObj.callBackFun(optionObj.callBackArgs);
                    return false;
                } else {
                    noMore = true;
                    L.open('tip')("不能翻页，当前分页的最后（或最前）一条", 1000);
                    return false;
                }
            }
        });
        if (!noMore) {
            regex = new RegExp("\\?.*", "i");
            currentHref = currentHref.replace(regex, '');
            thisFrame.src = currentHref + search;
        }
    };
    $thisFun.changPageTitle = function () {
        var $title = callBackObj.oDialogDivObj.find('.title').find('h4');
        var title = $title.text();
        var reg = /^(.+?\:).+?$/;
        var commonTitle = !!title.match(reg) ? title.match(reg)[1] : "";
        if (commonTitle) {
            $(thisFrame).on('load', function () {
                var frameGlobalOrder = thisFrame.contentWindow.allObj &&
                    thisFrame.contentWindow.allObj.order.globalOrder;
                $title.text(commonTitle + frameGlobalOrder);
            });
        }
    };
    /**
     *  描述: 关闭或者上一个下一个时候，进行保存草稿。当content中的数据和原数据不一致的时候，才会触发。或者没有原数据字段
     *      （origin-value）的情况下，每次都会请求。
     * 作者 : liubibo
     */
    $thisFun.saveDraft = function (argObj) {
        var url = argObj && argObj.url ? argObj.url : ROOT_URL + "/index.php?c=show_infoMgmt_com&a=saveDraft";
        var doc = thisFrame.contentWindow.document;
        var content = $(doc).find('[name="content"]');
        var contentVal = content ? content.val() : "";
        var mainMsg = $(doc).find('[name="mainMsgId"]');
        var mainMsgId = mainMsg ? mainMsg.val() : "";
        var msgType = $(doc).find('[name="msgType"]').val();
        if (msgType) {
            if (msgType =='caseNormal' || msgType =='caseReturn' || msgType =='conversation' || msgType =='message') {
                var mailReason = $(doc).find('[name="mailReason"]').val();
            }
        }
        if (content.attr('origin-value') !== undefined && content.attr('origin-value') !== contentVal) {
            $.ajax({                                                                                                            //获取不同状态的数量
                type: 'POST',
                url: url,
                data: {mainMsgId: mainMsgId, draft: contentVal, mailReason: mailReason},
                dataType: 'json',
                success: function (data) {
                    if (data.state) {
                        setTimeout(function () {                                                                         //延迟tip解决弹出框关闭，tip不显示问题。
                            window.top.L.open('tip')("草稿自动保存成功", 2000);
                        }, 500);
                    } else {
                        setTimeout(function () {
                            window.top.L.open('tip')(data.data, 2000);
                        }, 500);
                    }
                },
                error: function () {
                    setTimeout(function () {
                        window.top.L.open('tip')("草稿自动保存失败", 2000);
                    }, 1000);
                }
            });
        }
        if (mainMsgId) {
            //标识已点开邮件
            var oId  = mainMsgId.slice(2, mainMsgId.length);
            var $table = $('.table-wrapper').find('table');
            var $trs = $table.find('.of-paging_body').find('tr');
            var tableDate = $table.get(0).data;
            $.each($trs, function (i, thisIndex) {
                if (tableDate[i].id == oId) {
                    $(this).css({'background-color': '#ddd'});
                } 
            });
        }
    };
    var doc = thisFrame.contentWindow.document;
    var msgType = $(doc).find('[name="msgType"]').val();
    if (msgType) {
        if (msgType =='caseNormal' || msgType =='caseReturn' || msgType =='conversation' || msgType =='message') {
            var mailReason = $(doc).find('[name="mailReason"]').val();
            if (mailReason) {
                var content = $(doc).find('[name="content"]');
                var contentVal = content ? content.val() : "";
                if (mailReason =='-- 选择原因 --') {
                    mailReason = '';
                }
                if (mailReason.length < 1 && contentVal.length > 0) {
                    window.L.open('tip')('保存草稿,需要选择来邮原因', 2000);
                    return false;
                }
            }
        }
    }
    if (parseInt(callBack) == 1) {                                                                                      //调用iframe里面的保存
        thisFrame.contentWindow.saveBtnFun();
        return false;
    } else if (parseInt(callBack) == 2) {                                                                               //不做操作，如禁止保存
        return false;
    }  else if (parseInt(callBack) == 7) {                                                                               //用于速卖通订单留言详情上一页
        $thisFun.saveDraft();
        $thisFun.ultraTurnPage("-1");
        return false;
    } else if (parseInt(callBack) == 8) {                                                                               //用于速卖通订单留言详情下一页
        $thisFun.saveDraft();
        $thisFun.ultraTurnPage("+1");
        return false;
    } else if (callBack === true) {                                                                                     //用于点击关闭，保存草稿功能。
        var callRelate = callBackObj.oDialogDivObj.find('.title')
            .find('a[callback="true"]').attr('callback-relate');
        callRelate && $thisFun[callRelate] && $thisFun[callRelate]();
        //标识已点开邮件
        if (callRelate == 'ratingInfo' || callRelate == 'saveDraft') {
            var doc = thisFrame.contentWindow.document;
            var mainMsg = $(doc).find('[name="mainMsgId"]');
            var mainMsgId = mainMsg ? mainMsg.val() : "";
            if (mainMsgId) {
                var oId  = mainMsgId.slice(2, mainMsgId.length);
                var $table = $('.table-wrapper').find('table');
                var $trs = $table.find('.of-paging_body').find('tr');
                var tableDate = $table.get(0).data;
                $.each($trs, function (i, thisIndex) {
                    if (tableDate[i].id == oId) {
                        $(this).css({'background-color': '#ddd'});
                    } 
                });
            }
        }
    } else if (parseInt(callBack) == 9) {                                                                               //用于速卖通站内信详情上一页
        $thisFun.saveDraft();
        $thisFun.ultraTurnPage("-1");
        return false;
    } else if (parseInt(callBack) == 10) {                                                                              //用于速卖通站内信详情下一页
        $thisFun.saveDraft();
        $thisFun.ultraTurnPage("+1");
        return false;
    } else if (parseInt(callBack) == 11) {                                                                              //用于汇总订单，分仓订单，问题订单，ebay订单详情上一页
        $thisFun.ultraTurnPage("-1", {callBackFun: $thisFun.changPageTitle});
        return false;
    } else if (parseInt(callBack) == 12) {                                                                              //用于汇总订单，分仓订单，问题订单，ebay订单详情下一页
        $thisFun.ultraTurnPage("+1", {callBackFun: $thisFun.changPageTitle});
        return false;
    }
}
/**
 * 描述 : 用于统计tab中的有几条消息数据，根据table中的tbody中的tr数量来算
 * 参数 : obj选择器
 * tr额外情况 : 包含class jsShowNumFilter
 * tbody的额外情况 : 包含class of-paging_empty
 * 作者 : liubibo
 */
function showNum(obj) {
    var triggerShow = -1,
        $thisFun = arguments.callee;
    if ($(obj).length === 0) {
        return false;
    }
    $(obj).each(function (i, t) {
        var $this = $(this),
            $tbody = $this.find('table').find('tbody'),
            $isHidden = $this.hasClass('jsAuthDenied'),
            $showNum = $.trim($this.attr('showNum')),
            $trigger,
            $target,
            $regResult,
            $reg = /^(.+?)(?:,(.+?)){0,1}$/;
        $thisFun.appendTip = function (target, num) {                                                                   //用于添加tab上的tip（tip提示必填项）
            var thisObj = $(target);
            if (thisObj.find('.tip-wrapper.tip-num') === undefined ||
                thisObj.find('.tip-wrapper.tip-num').length <= 0) {
                thisObj.addClass('positionR').append($thisFun.createTip(num));
            }
        };
        $thisFun.createTip = function (num) {                                                                           //用于创建一个tip并返回。
            var tip = $('<div class="tip-wrapper tip-num positionA" ' +
                'style="background-color: rgba(255, 0, 0, 0.64);min-width:18px;text-align:center;' +
                'padding:2px;font-size:10px;top:-10px;left:10px; color:#fff;border-radius:50%;z-index:10;">'
                + num + '</div>');
            return tip;
        };
        $thisFun.numTarget = function (target, trigger) {
            if (trigger === "true" && triggerShow === -1 && $isHidden === false) {
                target.trigger('click');
                triggerShow++;
            }
        };
        $regResult = $showNum.match($reg);
        if (!!$regResult) {
            $target = !!$regResult[1] ? $('.' + $regResult[1]) : '';
            $trigger = !!$regResult[2] ? $regResult[2] : '';
        } else {
            return false;
        }
        $thisFun.countNum = function (object) {
            var $num = 0;
            object.each(function () {
                var $thisTbody = $(this);
                if ($thisTbody.hasClass('of-paging_empty')) {
                    return true;
                } else {
                    var $tr = $thisTbody.find('tr');
                    $tr.each(function () {
                        if (!$(this).hasClass('jsShowNumFilter') && $.trim($(this).find('td').text()).length > 0) {
                            $num++;
                        }
                    });
                }
            });
            if ($num > 0) {
                $thisFun.appendTip($target, $num);
                $thisFun.numTarget($target, $trigger);
            }
        };
        $thisFun.countNum($tbody);
    });
}
/**
 * 描述 : 用于监听当前按钮所在form下回车功能
 * 调用方法 : listenEnter({'submitBtn':'.jsSearchBtn'});
 * 作者 : liubibo
 */
function listenEnter(obj) {
    var $this = $(obj['submitBtn']);
    if ($this.length === 0) {
        return false;
    }
    $this.closest('form').on("keydown", function (e) {
        var theEvent = e || window.event;                                                                               // 兼容FF和IE和Opera
        var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
        if (code == 13) {
            $this.trigger('click');                                                                                     //回车执行查询
            e.preventDefault();
        }
    });
}
/**
 * 描述 : 用于ctrl+ 单击时候，直接触发悬浮框中 jsCtrlClick的元素
 * 作者 : liubibo
 */
$('.table-wrapper').find('.of-paging_body').on('click', 'tr', function (e) {
    if (e.ctrlKey) {
        e.preventDefault();
        $('.pop-details').find('.jsCtrlClick').trigger('click');
    }
});
function filterSelect() {
    var $this = $(this);
    var selects = $this.closest('.input-group').find('.jsRelateShow');
    var cloneSelects = selects.clone();                                                                                 //复制当前的select，将其在弹出页面显示
    cloneSelects.addClass('selectCopy').attr('size', '30');
    window.L.open('oDialogDiv')(
        "账号过滤选择，双击下拉框可快速选择并关闭", 'text:<div style="width:500px; height:550px;">' +
        '<div class="col-lg-6 add-space">' +
        '<input class="form-control jsFilterWord" type="text" placeholder="过滤关键字"/>' +
        '</div>' +
        '<div class="col-lg-6 add-space selectCopyWrapper"></div>' +
        '</div>', "550px", "650px", [1]
    );
    $('.selectCopyWrapper').append(cloneSelects);                                                                       //弹出页面之后，将复制的select放到里面
    $('.jsFilterWord').on('keyup paste', function () {                                                                  //监听过滤框输入和选择，之后过滤下拉框
        var thisVal = $(this).val();
        var select = $('.selectCopy');
        var filterVal;
        var tempCount = 0;
        $('.selectCopy').find('option').each(function () {                                                              //将每个下拉框根据过滤字进行对应处理
            var optionVal = $(this).text();
            if (optionVal.indexOf(thisVal) === -1) {
                $(this).addClass('displayNon');
            } else {
                $(this).addClass('filtered');
                $(this).removeClass('displayNon');
                if (tempCount === 0) {                                                                                  //由于过滤之后，选择项没有变，则将第一个符合条件的选择自动选择。
                    $('.selectCopy').val($(this).val());
                    selects.val($(this).val());
                }
                tempCount++;
            }
        });
    });
    $('.selectCopy').on('dblclick', function () {                                                                       //双击选择下拉框，快速选择和关闭页面
        var $id = $(this).closest('.oDialogDiv').attr('id');
        var $handle = $id.slice($id.indexOf('_') + 1, $id.length);
        L.open('oDialogDiv').dialogClose($handle);
    }).on('change', function () {                                                                                       //下拉框变换之后，填充原页面下拉框选择选项。
        selects.val($(this).val());
    });
}
/**
 * 描述 : 用来关联两个下拉框展现的数据，当一个数据选择之后，对应的数值和另一个数据的如data-value想匹配，则进行过滤显示。
 * 作者 : liubibo
 */
function relateFilter(filterVal, showObj, attr) {
    var relateAttr;
    var thisVal;
    if (filterVal === undefined || filterVal === "") {
        relateAttr = attr;
    } else {
        relateAttr = attr + '="' + filterVal + '"';
        $(showObj).find('option').not('.empty-opt').not('[' + relateAttr + ']').css({"display": "none"})
            .prop('disabled', 'disabled');
    }
    $(showObj).find('[' + relateAttr + ']').css({"display": ""}).prop('disabled', false);
    if ($(showObj).val() === null) {
        $(showObj).val("")
    }
    $(showObj).val();
}
/**
 * 描述 : 商品列表和分仓订单的tab功能切换
 * 参数 : tab 为切换的ul对象，mode 为是否有完整和简洁模式的切换
 * 备注 :
 *      tab标题结构: ul.nav-content-wrapper> li  > a
 *      tab内容结构: div.nav-content-wrapper > div.nav-tabs-content
 * 作者 : liubibo
 */
function tabSwitch(obj, mode) {
    var thisFun = arguments.callee;
    var $tabUl = $(obj);
    var $wrapper = $tabUl.parent().parent().find('.nav-content-wrapper');
    var $contents = $wrapper.find('.nav-tabs-content');
    var locKey = 'tab-switch-mode';
    /**
     * 描述 : 添加点击监听切换功能,并且完成后回调调整iframe高度
     * 作者 : liubibo
     */
    thisFun.tabSwitch = function ($obj) {
        $obj.each(function () {
            $(this).find('li').each(function (index, item) {
                $(this).on('click', function (e) {
                    var $this = $(this);
                    var str = $this.text();
                    var contents = $this.parent().parent().find('.nav-content-wrapper');
                    if ($this.hasClass('active')) {
                        return false;
                    } else {
                        $this.closest(obj).find('li').not($this).removeClass('active');
                        $this.addClass('active');
                        contents.find('.nav-tabs-content').not(contents.find('.nav-tabs-content')
                            .eq(index)).removeClass('active');
                        contents.find('.nav-tabs-content').eq(index).addClass('active');
                    }
                    if (str.trim().indexOf('模板') == -1) {
                        resizeIframe('body');                                                                               //用来刷新iframe的高度
                    } else {
                      //保存table的选择
                      document.cookie="tableName="+str.trim();
                    }
                })
            });
        });
    };
    /**
     * 描述 : 从本地存储中存储对应的字段，数值为 true 或 false
     * 作者 : liubibo
     */
    thisFun.storedMode = function (mode) {
        var loc = !!window.localStorage ? window.localStorage : "";
        if (loc) {
            loc.setItem(locKey, mode);
        } else {
            console.warn('浏览器不支持本地存储，不能展现完整模式');
        }
    };
    /**
     * 描述 : 从本地存储中获取对应的存储状态
     * 作者 : liubibo
     */
    thisFun.getStore = function (key) {
        var loc = !!window.localStorage ? window.localStorage : "";
        if (loc) {
            return loc.getItem(locKey) === "true" ? true : false;
        } else {
            console.warn('浏览器不支持本地存储，不能展现完整模式');
        }
    };
    /**
     * 描述 : 用于点击回调切换模式或者直接修改模式,并且完成后回调调整iframe高度
     * 参数 : e 为字符或者布尔,或者按钮点击事件
     * 作者 : liubibo
     */
    thisFun.changeMode = function (e) {
        var $mode;
        var checked;
        if (typeof e === "string" || typeof e === "boolean") {
            checked = e;
        } else {
            $mode = $(this);
            checked = $mode.prop('checked');
        }
        if (checked === true || checked === "true") {
            $wrapper.addClass('full-mode');
            $tabUl.addClass('full-mode');
            $contents.find('.jsTabTitle').removeClass('displayNon');
            $contents.each(function (i, t) {
                var title = $tabUl.find('li').eq(i).find('a').text().replace(/\(\w+\)/, "");
                $(this).attr('title', title);
            });
            resizeIframe('body');                                                                                       //用来刷新iframe的高度
        } else {
            $wrapper.removeClass('full-mode');
            $tabUl.removeClass('full-mode');
            $contents.find('.jsTabTitle').addClass('displayNon');
            resizeIframe('body');                                                                                       //用来刷新iframe的高度
        }
        thisFun.storedMode(checked);
    };
    /**
     * 描述 : 用于初始完整或者简洁模式
     * 参数 : mode 为true则为初始化,否则不就行初始化.
     * 作者 : liubibo
     */
    thisFun.initMode = function (mode) {
        var locVal;
        var $modeComponent;
        var $modeBtn;
        locVal = thisFun.getStore(locKey);
        if (!mode || locVal === undefined) {
            return false;
        }
        $modeComponent = $('<div class="pull-right tab-mode-component jsTabMode">' +
            '   <input type="checkbox" value="完整模式" title="开启完整模式">' +
            '   <span>完整模式</span>' +
            '</div>');
        $modeBtn = $modeComponent.find('[type=checkbox]');
        $tabUl.append($modeComponent);
        $modeBtn.prop('checked', locVal);
        $modeBtn.on('click', thisFun.changeMode);
        thisFun.changeMode(locVal);
    };
    !!mode ? thisFun.initMode(mode) : "";
    thisFun.tabSwitch($tabUl);
}
/**
 * 描述 : 点击回邮和case的历史记录关闭或者展开
 * 作者 : liubibo
 */
function changeNotes(obj) {
    if ($(obj).next().hasClass("displayNon")) {
        $(obj).next().removeClass("displayNon");
        //resizeTextArea();
        resizeIframe();
    } else {
        $(obj).next().addClass("displayNon");
    }
}
/**
 * 描述 : 由于弹出框的100%高度下，需要监听页面高度
 * 作者 : liubibo
 */
function iframeFullHeight() {
    var $oDialogDiv = L.open('oDialogDiv');
    var ancestorWindow = $oDialogDiv.getAncestorWindow();
    if (ancestorWindow !== window) {                                                                                    //当是弹出框调用的时候，才进行绑定
        setTimeout(function () {
            $(ancestorWindow).off('resize.resizeHeight');
            var windowHeight = $(ancestorWindow).height();
            var windowWidth = $(ancestorWindow).width();
            var $iframes = $oDialogDiv.getTreeNode();
            var resizeIframe = [];
            for (var k = 0, l = $iframes.length; k < l; k++) {
                var iframeWidth = $iframes[k].oDialogDivObj.width();
                var iframeHeight = $iframes[k].oDialogDivObj.height();
                var tempObj = {obj: "", width: ""};
                if ((iframeHeight + 20 > windowHeight) && (iframeHeight - 20 < windowHeight)) {
                    tempObj.obj = $iframes[k].oDialogDivObj.get(0);
                    tempObj.width = $iframes[k].oDialogDivObj.width();
                    resizeIframe.push(tempObj);
                }
            }
            ancestorWindow.delayResize = false;
            $(ancestorWindow).on('resize.resizeHeight', function () {
                if (!!ancestorWindow.delayResize) {
                    clearTimeout(ancestorWindow.delayResize);
                }
                ancestorWindow.delayResize = setTimeout(function () {
                    for (var k = 0, l = resizeIframe.length; k < l; k++) {
                        $oDialogDiv.skinLayout(resizeIframe[k].obj, resizeIframe[k].width, '100%');
                    }
                }, 200);
            });
            $(window).unload(function () {                                                                              //当页面关闭之时,取消
                $(ancestorWindow).off('resize.resizeHeight');
            });
        }, 300);
    }
}
/**
 * 描述 : 用于ajax成功或者失败后的回掉，弹出信息功能。
 * 调用方法 : ajaxCallbackHint(true)(data,'state','info',true,'操作成功','操作失败',false);
 *           ajaxCallbackHint(false)(error,'state','info','',"操作成功","操作失败",false);
 * 参数 : ajaxCallbackHint（success）true为ajax的success回调，false为error的回调。
 *      在true的情况下 (arr, state ,info, checkState,successWord,errorWord,reload)
 *          arr         :后台传递过来的数组
 *          state       :为状态字段
 *          info        :提示信息字段
 *          checkState  :检测符合的状态
 *          successWord :成功的提示信息，后台没有传过来信息时候显示
 *          errorWord   :失败的提示信息，后台没有传过来信息时候显示
 *          reload      :是否成功后刷新页面 close为自动关闭oDialogDiv, "closeBtn"为弹出tip有关闭按钮，"closeBtnSuc"同于closeBtn
 *                      （但只有返回成功才会有有关闭按钮）
 *      在false的情况下 (arr, state, info, checkState,successWord,errorWord,sqlHint)
 *          sqlHint     :是否提示sql报错
 * 返回值 : 当操作成功，返回true，操作失败，返回false。（即使sql报错情况下，也返回true）
 * 所支持的各种情况的结果:
 *      $data = {state: 300, info: ""};//结果是  申请失败
 *      $data = {state: 300, info : []};//结果是  申请失败
 *      $data = {state: 200, info: ""};//结果是  申请成功
 *      $data = {state: 200, info:[]};//结果是  申请成功
 *      $data = {state: "", info:[]};//结果是  申请失败
 *      $data = {state: [], info:[]};//结果是  申请失败
 *      $data = {info:[]};//结果是  申请失败
 *      $data = {info:""};//结果是  申请失败
 *      $data = {info:"订单在海外仓ERP不为新录入状态"};//结果是  订单在海外仓ERP不为新录入状态
 *      $data = {info:["订单在海外仓ERP不为新录入状态"]};//结果是  订单在海外仓ERP不为新录入状态
 *      $data = {info:["订单在海外仓ERP不为新录入状态","订单在海外仓ERP不为新录入状态2"]};//结果是  订单在海外仓ERP不为新录入状态,订单在海外仓ERP不为新录入状态2
 *      $data = {state: 200,info:["订单在海外仓ERP不为新录入状态","订单在海外仓ERP不为新录入状态2"]};//结果是  订单在海外仓ERP不为新录入状态,订单在海外仓ERP不为新录入状态2
 *      $data = {state: 300,info:["订单在海外仓ERP不为新录入状态","订单在海外仓ERP不为新录入状态2"]};//结果是  订单在海外仓ERP不为新录入状态,订单在海外仓ERP不为新录入状态2
 *      $data = {state: 200, info: "订单在海外仓ERP不为新录入状态,不可修改"}; //结果是 订单在海外仓ERP不为新录入状态,不可修改
 *      $data = {state: 300, info: "订单在海外仓ERP不为新录入状态,不可修改"};//结果是 订单在海外仓ERP不为新录入状态,不可修改
 *      $data = {state: 300,info:[{sku:"A301",goods:"一个sku"},{sku:"A303",goods:"一个sku2"}]};//结果是  sku:"A301",goods:"一个sku"   sku:"A303",goods:"一个sku2"
 *      $data = {state: 300,info:["A304",{sku:"A303",goods:"一个sku2"}]};//结果是  A301   sku:"A303",goods:"一个sku2"
 *      $data = {state: 200,info:["A304",{sku:"A303",goods:"一个sku2"}]};//结果是  A301   sku:"A303",goods:"一个sku2"
 *      $data = {state: 200,info:["A304",{sku:["A304","A305"],goods:"一个sku2"}]};//结果是  A301   sku:"A303" "A305" , goods:"一个sku2"
 * 作者 : liubibo
 */
function ajaxCallbackHint(success) {
    var thisFun = arguments.callee;
    thisFun.successCallback = function (arr, state, info, checkState, successWord, errorWord, reload) {
        var closeType = typeof reload === "string" ? reload.match(/closeBtn(\w*)/) : "";
        var time;
        if (!!arr[state] && ( !checkState || arr[state] == checkState )) {
            if (!!closeType && !closeType[1]) {
                time = false;
            } else if (!!closeType && closeType[1] === "Suc") {
                time = false;
            } else {
                time = !!parseFloat(reload) ? parseFloat(reload) : "";
            }
            thisFun.differentData(arr, info, successWord, time);
            if (!!reload) {
                if (reload === "close") {
                    setTimeout(function () {
                        var tempObj = L.open('oDialogDiv').getTreeNode();
                        L.open('oDialogDiv').dialogClose(tempObj[tempObj.length - 1].handle);
                    }, 1200);
                } else if (reload === true) {
                    setTimeout(function () {
                        window.location.reload()
                    }, 1200);
                }
            }
            return true;
        } else {
            if (!!closeType && !closeType[1]) {
                time = false;
            } else if (!!closeType && closeType[1] === "Err") {
                time = false;
            } else {
                time = !!parseFloat(reload) ? parseFloat(reload) : "";
            }
            thisFun.differentData(arr, info, errorWord, time);
            return false;
        }
    };
    thisFun.errorCallback = function (arr, state, info, checkState, successWord, errorWord, reload, sqlHint) {
        var regex = /(\{.*?\})/g;
        var result = arr.responseText.match(regex);
        var sqlHint = !!sqlHint ? " sql报错" : '';
        if (!!result) {                                                                                                 //查看后台返回中是否有state为true
            var tempObj = JSON.parse(result[0].replace("\\",""));
            if (!!tempObj[checkState]) {
                //window.L.open('tip')(successWord + sqlHint, 2000);
                thisFun.differentData(arr, info, successWord + sqlHint);
                if (reload == "close") {
                    setTimeout(function () {
                        var tempObj = L.open('oDialogDiv').getTreeNode();
                        L.open('oDialogDiv').dialogClose(tempObj[tempObj.length - 1].handle);
                    }, 1200);
                } else if (!!reload) {
                    setTimeout(function () {
                        window.location.reload()
                    }, 1200);
                }
                return true;
            } else {
                thisFun.differentData(arr, info, errorWord);
                return false;
            }
        } else {                                                                                                        //当后台内容中，没有state为true的情况，直接弹出保存失败
            thisFun.differentData(arr, info, errorWord + sqlHint);
            return false;
        }
    };
    /**
     * 描述 : 用于检测是否是空，如果是空返回true，否则返回false
     */
    thisFun.checkEmpty = function (objVal) {
        if (objVal === undefined || objVal === null || objVal === "") {
            return true;
        } else if ($.isArray(objVal)) {
            if (objVal.length === 0) {
                return true;
            }
        } else if (typeof objVal === "object" && objVal.constructor.name === "Object") {
            for (var key in objVal) {
                return false;
            }
            return true;
        } else {
            return false;
        }
    };
    /**
     * 描述 : 用于后台传过来的提示信息不同情况下，要进行不同的处理，不然会js报错。
     * 作者 : liubibo
     */
    thisFun.differentData = function (arr, info, errorWord, time) {
        var time = time === false ? time : !!parseFloat(time) ? parseFloat(time) : 2000;
        var tempDiv = $('<div class="tempDiv"></div>');
        var closeBtn = "";
        var $body = $(L.open('oDialogDiv').getAncestorWindow().document.body);
        if (time === false) {
            closeBtn = $("<input class='btn btn-default btn-xs close-btn' " +
                "style='text-align:center; position:absolute;top:2px;right:2px;width:16px;height:16px;" +
                "font-size:14px;line-height:12px;padding:1px;border-radius:50%;' " +
                "type='button' value='×' />").appendTo(tempDiv);                                                        //添加关闭按钮到tempDiv里面
            $body.on('click.closeTip', '.close-btn', function () {
                $body.off('click.closeTip');
                window.L.open('tip')();
            });
        }
        if (!arr[info]) {
            tempDiv.append($('<div>' + errorWord + '</div>'));
            window.L.open('tip')(tempDiv.get(0).outerHTML, time);
            return false;
        } else if (typeof arr[info] === "string") {
            tempDiv.append($('<div>' + arr[info] + '</div>'));
            window.L.open('tip')(tempDiv.get(0).outerHTML, time);
        } else if (($.isArray(arr[info]) && arr[info].length) ||
            (arr[info].constructor.name === "Object" && !thisFun.checkEmpty(arr[info]))) {
            tempDiv.append(thisFun.multiKey(arr[info]));
            window.L.open('tip')(tempDiv.get(0).outerHTML, time);
            return false;
        } else {
            tempDiv.append($('<div>' + errorWord + '</div>'));
            window.L.open('tip')(tempDiv.get(0).outerHTML, time);
            return false;
        }
    };
    thisFun.multiKey = function (objOrArr) {
        if ($.isArray(objOrArr) && objOrArr.length) {
            var tempDiv = $("<div class='errorDiv'></div>");
            for (var i = 0, l = objOrArr.length; i < l; i++) {
                var tempHTML = arguments.callee(objOrArr[i]);
                tempDiv.append(tempHTML);
            }
            return tempDiv;
        } else if (objOrArr.constructor.name === "Object" && !thisFun.checkEmpty(objOrArr)) {
            var tempSpan = $("<div class='objectDiv'></div>");
            for (var key in objOrArr) {
                var tempUnit = $("<div class='objectUnit'></div>");
                var tempKey = $("<span class='small-padding objectKey'></span>");
                var tempVal = $("<span class='objectVal'></span>");
                var tempHTML = arguments.callee(objOrArr[key]);
                var space = $('<span>: </span>');
                tempKey.text(key);
                tempUnit.append(tempKey);
                tempUnit.append(space);
                tempVal.append(tempHTML);
                tempUnit.append(tempVal);
                tempSpan.append(tempUnit);
            }
            return tempSpan;
        } else {
            var tempString = $("<span class=stringDiv></span>");
            tempString.text(objOrArr);
            return tempString;
        }
    };
    if (!!success) {
        return thisFun.successCallback;
    } else {
        return thisFun.errorCallback;
    }
}

/**
 * 描述 : 用于新增一行
 * 作者 : liubibo
 */
function addNewRow(event) {
    var param = event.data;
    var origin = param.origin;
    var target = param.target;
    var cloneTr = $(origin).find('tr').clone().removeClass('displayNon');
    if (!!param.randomKey) {
        var randomID = "random" + (Math.random() * 10000).toFixed(0);
        cloneTr.find('.jsIsKey').val(randomID);
    }
    if (param.appendOrPre === true) {
        $(target).find('tbody').prepend(cloneTr);
    } else {
        $(target).find('tbody').append(cloneTr);
    }
    if (!!param.insertBefore) {
        cloneTr.insertBefore($(target).find('tbody').find(param.insertBefore));
    }
    resizeIframe('body');                                                                                               //用来刷新iframe的高度
}
/**
 * 描述 : 生成当前时间
 * 格式 : 2016-01-01 08:10:11
 * 作者 : liubibo
 */
function nowTime() {
    var tDate = new Date();
    var tMonth = tDate.getMonth() < 10 ? '0' + (tDate.getMonth() + 1) : tDate.getMonth();
    var tDates = tDate.getDate() < 10 ? '0' + tDate.getDate() : tDate.getDate();
    var tHours = tDate.getHours() < 10 ? '0' + tDate.getHours() : tDate.getHours();
    var tMinutes = tDate.getMinutes() < 10 ? '0' + tDate.getMinutes() : tDate.getMinutes();
    var tSeconds = tDate.getSeconds() < 10 ? '0' + tDate.getSeconds() : tDate.getSeconds();
    var now = tDate.getFullYear() + '-' + tMonth + '-' + tDates + ' ' + tHours + ':' + tMinutes + ':' + tSeconds;
    return now;
}
/**
 * 描述 : 用于检查几个详情页面的各个字段是否修改过，返回给组check-group，修改添加jsChanged的class，无修改添加jsUnchanged。
 *      每个带有name或者有class为jsIsKey的输入框，编辑过会标记jsCheckDirty ，修改过标记jsChanged，未编辑jsCheckPristine
 *      未修改jsUnchanged。
 * 参数 : argsObj可以不传，一般用于页面有很多同名的check-group，如ebay详情页面有很多个check-group="orderRefund"
 *      argsObj.groups为当前的需要绑定的check-group
 *      argsObj.body为文档或者全组的标记。
 *      argsObj.filter为监听页面中的对应的东西编辑框。
 * 作者 : liubibo
 */
function checkGroupChanged(argsObj){
    var thisFun = arguments.callee;
    var $groups;
    var filter;
    var $names;
    var $body;
    var defaultOp = {                                                                                                   //如果没有argsObj传递过来的情况下，默认选项
        groups: "[check-group]",
        body: 'body',
        filter: 'input[name],select[name],textarea[name],.jsIsKey'
    };
    !!argsObj ? $.extend(defaultOp, argsObj) : "";
    $body = $(defaultOp.body);
    $groups = $(defaultOp.groups);
    filter = defaultOp.filter;
    $names = $groups.find(filter);
    /**
     * 描述 : 用于初始化，标记未编辑和为聚焦，同时绑定监听事件。
     * 作者 : liubibo
     */
    thisFun.init = function(){
        $body.attr('check-group','all').addClass('jsUnchanged');
        $groups.addClass('jsUnchanged');
        $names.each(function(){
            var $name = $(this);
            $name.data('pristine-value',$name.val().toString())
                .addClass('jsCheckPristine jsUnchanged');
        });
        $groups.on('change focus blur input',filter, function(e){
            var $name = $(this);
            if( !$name.data('pristine-value') ||
                $.trim( $name.data('pristine-value') ) !== $.trim( $name.val() ) ) {
                $name.removeClass('jsUnchanged').addClass('jsChanged')
                    .closest('[check-group]').removeClass('jsUnchanged').addClass('jsChanged');
                $body.removeClass('jsUnchanged').addClass('jsChanged');
            }else {
                $name.addClass('jsUnchanged').removeClass('jsChanged');
                if( !$name.closest('[check-group]').find(filter).not($name.get(0)).hasClass('jsChanged') ) {
                    $name.closest('[check-group]').addClass('jsUnchanged').removeClass('jsChanged');
                }
                if( thisFun.getResult('checkAll') ){
                    $body.addClass('jsUnchanged').removeClass('jsChanged');
                }
            }
            if( e.type === 'focus'|| e.type === 'change' ){
                $name.addClass('jsCheckDirty').removeClass('jsCheckPristine');
            }
        });
    };
    /**
     * 描述 : 用于获取分组是否修改过，返回tru为修改过，false为没有修改过，返回null为没有找到
     * 参数 : group 用于获取对应的check-group结果
     * 作者 : liubibo
     */
    thisFun.getResult = function(group){
        var result = null;
        var checkGroup;
        if(group !== "all") {
            if (typeof group === "object") {
                $groups = $(group.groups);
                group = group.groups;
                $groups.each(function (i, t) {
                    var $thisGroup = $(this);
                    if (result === null) {
                        result = true;
                    }
                    if ($thisGroup.hasClass('jsChanged') || $thisGroup.hasClass('jsChangeDeleted')) {
                        result = false;
                    }
                });
            } else {
                $groups.each(function (i, t) {
                    var $thisGroup = $(this);
                    if ($.trim(group) === "checkAll") {
                        checkGroup = "checkAll";
                    } else {
                        checkGroup = $.trim($thisGroup.attr('check-group'));
                    }
                    if (checkGroup === group) {
                        if (result === null) {
                            result = true;
                        }
                        if ($thisGroup.hasClass('jsChanged') || $thisGroup.hasClass('jsChangeDeleted')) {
                            result = false;
                        }
                    }
                });
            }
        }else {
            result = !$body.hasClass('jsChanged');
        }
        return result;
    };
    /**
     * 描述 : 用于标记页面中的对应改组的状态为修改或者为删除。
     * 作者 : liubibo
     */
    thisFun.changeState = function (group, type) {
        var $group = $('[check-group="' + group + '"]');
        $group.removeClass('jsUnchanged').addClass('jsChanged');
        if (type === "delete") {
            $group.addClass("jsChangeDeleted");
        }
    };
    thisFun.init();
}

$(function () {
    checkAuthorize('body');                                                                                             //调用权限功能
    //iframeFullHeight();                                                                                                 //高度自适应
});
/**
 * 描述 : 检查数据是否为空，为空返回true,否非为false
 * 作者 : liubibo
 */
function checkaEmptyAll(objVal) {
    if (objVal === undefined || objVal === null || objVal === "") {
        return true;
    } else if ($.isArray(objVal)) {
        if (objVal.length === 0) {
            return true;
        } else {
            return false;
        }
    } else if (typeof objVal === "object" && objVal.constructor.name === "Object") {
        for (var key in objVal) {
            return false;
        }
        return true;
    } else {
        return false;
    }
}
/**
 * 描述 : 用于点击大图时候，弹出弹出框到最外层，并且能够点击左右。
 * 参数 :
 *      e : jq event事件或者是调用子函数的名字
 *      e.data.area : 同一组图片的所在区域
 *      object : 调用子函数时候的附加参数
 * 作者 : liubibo
 */
function popBigPic(e, object) {
    var thisFun = arguments.callee;
    /**
     * 描述 : 点击关闭按钮时候关闭清空整个弹出层
     */
    thisFun.close = function (obj) {
        var $tree = L.open('oDialogDiv').getTreeNode();
        var $img = $(obj);
        if ($tree && $tree.length > 0) {                                                                                //如果是弹出框，需要单独处理
            var thisFrame = L.open('oDialogDiv').getTreeNode(L.open('oDialogDiv').getTreeNode().length - 1)
                .oDialogDivObj.find('iframe').get(0).contentWindow;
            thisFrame.jQuery.event.remove(window.document.body, '.lockScreen');                                         //解除绑定，由于穿透到父级,$parentBody.off('.lockScreen')不能找到对应的jQuery._data( elem );
        } else {
            $('body').off('.lockScreen');
        }
        $img.closest('.pop-big-div').remove();
    };
    /**
     * 描述 : 点击向左按钮，从弹出层中取图片地址数据（json.stringify），以及当前图片的index
     */
    thisFun.left = function (obj) {
        var $popDiv = $(obj).closest('.pop-big-div');
        var imgObj = JSON.parse($popDiv.attr('img-arr'));
        var imgArr = imgObj.img;
        var ind = parseFloat($popDiv.attr('img-ind'));
        var whichOne, result;
        if (ind <= 0) {
            $popDiv.find('.left-image').css({
                cursor: "not-allowed"
            });
            window.L.open('tip')('已经是第一张图片', 2000);
            return false;
        } else {
            if (ind + 1 <= imgArr.length) {
                $popDiv.find('.right-image').css({
                    cursor: "url(" + ROOT_URL+ "/view/images/rightArr.png),auto"
                })
            }
        }
        whichOne = ind > 0 ? (--ind) : 0;
        result = imgArr[whichOne].replace(reg, "$1");
        $popDiv.find('.pop-image').attr('src', result);
        $popDiv.find('.pop-small-image').attr('src', imgArr[whichOne]);                                                 //更新小的预览图
        $popDiv.attr('img-ind', whichOne);
    };
    thisFun.right = function (obj) {
        var $popDiv = $(obj).closest('.pop-big-div');
        var imgObj = JSON.parse($popDiv.attr('img-arr'));
        var imgArr = imgObj.img;
        var ind = parseFloat($popDiv.attr('img-ind'));
        var whichOne, result;
        if (ind + 1 >= imgArr.length) {                                                                                 //提示没有更多，同时悬浮图标改变
            $popDiv.find('.right-image').css({
                cursor: "not-allowed"
            });
            window.L.open('tip')('已经是最后一张图片', 2000);
            return false;
        } else {
            $popDiv.find('.left-image').css({
                cursor: "url(" + ROOT_URL+ "/view/images/leftArr.png),auto"
            });
        }
        whichOne = ind < imgArr.length - 1 ? (++ind) : ind;
        result = imgArr[whichOne].replace(reg, "$1");
        $popDiv.find('.pop-image').attr('src', result);
        $popDiv.find('.pop-small-image').attr('src', imgArr[whichOne]);
        $popDiv.attr('img-ind', whichOne);
    };
    var reg = /(\.(jpg|png|gif|jpeg|bmp))[\s\S]*?\.\2/i;                                                                //过滤掉.jpg_140X140.jpg的后缀
    var parentWin = L.open("oDialogDiv").getAncestorWindow();
    var $parentBody = $(parentWin.document.body);
    if (typeof e === "string") {
        thisFun[e](object);
    } else {
        if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
            var $this = $(this);
            var dataObj = e.data;
            var defaultOp = {
                area: ".jsPopBigArea"
            };
            var imgObj = {img: []};
            var ind = 0;
            var src = $this.attr('src');
            var nowOp = $.extend({}, defaultOp, dataObj);
            e.preventDefault();
            if (src) {
                var $popBig = $('<div class="bgDiv pop-big-div"></div>');
                var $bgSub = $('<div class="bg-sub-div"></div>');
                var $smallArea = $('<div class="positionA pop-small-area textC"></div>');
                var $bigArea = $('<div class="positionA pop-big-area textC"></div>');
                var $leftImage = $('<div class="positionA left-image" ' +
                    'onclick="popBigPic(\'left\',this)"></div>');
                var $rightImage = $('<div class="positionA right-image" ' +
                    'onclick="popBigPic(\'right\',this)"></div>');
                var $closeImage = $('<div class="positionA textC close-image" ' +
                    'onclick="popBigPic(\'close\',this)">×</div>');
                var $focusInput = $('<input class="positionA textC focue-input" ' +
                    'type="text" style="visibility: visible; width:1px; height: 1px; opacity: 0.1">');                  //用于聚焦到当前的大图位置，解决esc关闭导致oDialog被关闭，滚动无法解锁问题。
                var result = src.replace(reg, "$1");
                var $popImg = $('<img class="pop-image" src="' + result + '"/>');
                var $popSmallImg = $('<img class="pop-small-image" style="cursor:progress;" src="' + src + '"/>');            //用于显示小的预览图
                $popBig.append($bgSub);
                $bgSub.append($smallArea);
                $smallArea.append($popSmallImg);
                $bgSub.append($bigArea);
                $bigArea.append($popImg);
                $bgSub.append($leftImage);
                $bgSub.append($rightImage);
                $bgSub.append($closeImage);
                $bgSub.append($focusInput);
                $this.closest(nowOp.area).find('.jsPopBigPic').each(function (i, t) {
                    if (this.src === src) {
                        ind = i;
                    }
                    imgObj.img.push(this.src);
                });
                $popBig.attr('img-arr', JSON.stringify(imgObj))
                    .attr('img-ind', ind)
                    .css({
                        top: $parentBody.scrollTop()
                    });
                $parentBody.append($popBig)
                    .on('scroll.lockScreen mousewheel.lockScreen', function (e) {                                       //阻止窗口上下移动。
                        e.preventDefault();
                        return false;
                    }).on('keydown.lockScreen ', function (e) {
                        var keys = [37, 38, 39, 40];
                        var isKey = false;
                        $.each(keys, function (i, t) {
                            if (e.keyCode == t) {
                                isKey = true;
                                return false;
                            }
                        });
                        if (isKey) {
                            return false;
                        } else if (e.keyCode == 27) {
                            $parentBody.find('.pop-big-div').find('.close-image').trigger('click');
                            e.stopPropagation();
                            return false;
                        }
                    });
                $focusInput.focus();
                var callBackObj = window.oDialogDiv.getTreeNode(-1);
                if (typeof(callBackObj) !== 'undefined') {
                    callBackObj.config.escCloseFlag = 1;                                                                //按esc不触发关闭弹出层标记
                }
            }
        }
    }
}
/**
 * 描述 : 用于弹出框中的上一页和下一页的映射触发弹出框外部的上一页下一页
 * 参数 :
 *      e : jq按钮时间
 *      e.data : 按钮触发上或者下页
 * 作者 : liubibo
 */
function pageUPDown(e) {
    var prevNext = e.data;
    var oDialogDiv = L.open('oDialogDiv');
    var treeNode = oDialogDiv.getTreeNode();
    treeNode = treeNode ? oDialogDiv.getTreeNode(treeNode.length - 1).oDialogDivObj.get(0) : "";
    if (prevNext === "down") {
        var $next = $(treeNode).find('.operating').find('.jsNextBtn');
        $next.length > 0 && $next.get(0).click();
    } else {
        var $prev = $(treeNode).find('.operating').find('.jsPreviousBtn');
        $prev.length > 0 && $prev.get(0).click();
    }
}
/**
 * 描述 : 两个相关联的信息，一个变更后，另一个请求后台获得返回值。
 * 备注 : 默认参数 :
 *        var defaultOp = {
 *          target: "jsCountyRelated",
 *          url: "show_com&a=getCountryCode",
 *          appendKey: "name",
 *          targetLock: "1",                                                                                            //ajax后填充数据，1为成功后锁定目标，2为失败后锁定，0为不锁定
 *          tipSuc: "获取成功",
 *          tipErr: "获取失败",
 *          type: "GET"
    };
 * 作者 : liubibo
 */
function relatedInfo (e) {
    var defaultOp = {
        target: ".jsCountyRelated",
        url: "show_order&a=getCountryCode",
        appendKey: "name",
        targetLock: "1",                                                                                            //ajax后填充数据，1为成功后锁定目标，2为失败后锁定，0为不锁定
        tipSuc: "获取成功",
        tipErr: "获取失败",
        targetDataKey: "content",
        type: "GET"
    };
    var thisVal = $(this).val();
    var $target = $(e.data.target);
    var targetDataKey;
    $.extend(true, defaultOp, e.data);
    if (defaultOp.targetDataKey.match(/\w+\.\w+/)) {
        targetDataKey = defaultOp.targetDataKey.split('.');
    }
    if (thisVal) {
        $.ajax({
            url: defaultOp.url + '&' + defaultOp.appendKey + '='+ thisVal,
            type: defaultOp.type,
            dataType: "JSON",
            beforeSend: function () {                                                                               //当触发ajax时候，页面添加一个半透明灰色背景
                var bgDiv = $('<div class="bgDiv"></div>');
                $("body").append(bgDiv);
                $target.val("获取中");
            },
            success: function (data) {
                var result = ajaxCallbackHint(true)(data, 'state', 'info', '200',
                    defaultOp.tipSuc, defaultOp.tipErr, false);
                if (result) {
                    var content = data;
                    if (typeof targetDataKey !== 'string') {
                        $.each(targetDataKey, function (i, t) {
                            content = content[t];
                        });
                    } else {
                        content = content[targetDataKey];
                    }
                    $target.val(content).addClass('jsCodeFilled');
                    if (defaultOp.targetLock == "1") {
                        $target.attr('readonly', 'readonly');
                    }
                } else {
                    $target.val("");
                    if (defaultOp.targetLock == "2") {
                        $target.attr('readonly', 'readonly');
                    }
                }
            },
            error: function (error) {                                                                               //临时用于，后台保存成功，state为true，但是后台返回报错的情况
                ajaxCallbackHint(false)(error, 'state', 'info', '200',
                    defaultOp.tipSuc, defaultOp.tipErr, false);
                $target.val("");
                if (defaultOp.targetLock == "2") {
                    $target.attr('readonly', 'readonly');
                }
            },
            complete: function () {                                                                                 //接触锁定页面的半灰色背景
                $("body").find('.bgDiv').remove();
            }
        });
    }
}

/**
 * 描述 : 等待加载效果
 * 作者 : zzg
 */
(function ($) {
    $.fn.jqLoading =function(option) {
        var defaultVal = {
            backgroudColor: "#ECECEC",                                                                                  //背景色
            backgroundImage: ROOT_URL + '/view/images/loadings.gif',                                                    //背景图片
            text: "正在加载中，请耐心等待....",                                                                            //文字
            width: 150,                                                                                                 //宽度
            height: 60,                                                                                                 //高度
            type:0                                                                                                      //0全部遮，1 局部遮
        };
        var opt = $.extend({}, defaultVal, option);
        if (opt.type == 0) {
                                                                                                                        //全屏遮
            openLayer();
        } else {
                                                                                                                        //局部遮(当前对象应为需要被遮挡的对象)
            openPartialLayer(this);
        }

                                                                                                                        //销毁对象
        if (option === "destroy") {
            closeLayer();
        }

                                                                                                                        //设置背景层高
        function height () {
            var scrollHeight, offsetHeight;
                                                                                                                        // handle IE 6
            if ($.support.boxModel && $.support.leadingWhitespace) {
                scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
                offsetHeight = Math.max(document.documentElement.offsetHeight, document.body.offsetHeight);
                if (scrollHeight < offsetHeight) {
                    return $(window).height();
                } else {
                    return scrollHeight;
                }
                                                                                                                        // handle "good" browsers
            }
            else if ($.support.objectAll) {
                return $(document).height() - 4;
            }
            else {
                return $(document).height()+500;
            }
        };

                                                                                                                        //设置背景层宽
        function width() {
            var scrollWidth, offsetWidth;
                                                                                                                        // handle IE
            if ($.support.boxModel) {
                scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
                offsetWidth = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);
                if (scrollWidth < offsetWidth) {
                    return $(window).width();
                } else {
                    return scrollWidth;
                }
                                                                                                                        // handle "good" browsers
            }
            else {
                return $(document).width();
            }
        };

                                                                                                                        /*==========全部遮罩=========*/
        function openLayer() {
            //背景遮罩层
            var layer = $("<div id='layer'></div>");
            layer.css({
                zIndex:9998,
                position: "absolute",
                height: height() + "px",
                width: width() + "px",
                background: "black",
                top: 0,
                left: 0,
                filter: "alpha(opacity=30)",
                opacity: 0.3

            });

                                                                                                                        //图片及文字层
            var content = $("<div id='content'></div>");
            content.css({
                textAlign: "left",
                position:"absolute",
                zIndex: 9999,
                height: opt.height + "px",
                width: opt.width + "px",
                top: "50%",
                left: "50%",
                verticalAlign: "middle",
                background: opt.backgroudColor,
                borderRadius:"8px",
                fontSize:"13px"
            });

            content.append("<img style='vertical-align:middle;margin:"+(opt.height/4)+"px; 0 0 5px;margin-right:5px;' src='" + opt.backgroundImage + "' /><span style='text-align:center; vertical-align:middle;'>" + opt.text + "</span>");
            $("body").append(layer).append(content);
            var top = content.css("top").replace('px','');
            var left = content.css("left").replace('px','');
            content.css("top",(parseFloat(top)-opt.height/2)).css("left",(parseFloat(left)-opt.width/2));

            return this;
        }
                                                                                                                        //销毁对象
        function closeLayer() {
            $("#layer,#content,#partialLayer").remove();
            return this;
        }

                                                                                                                        /*==========局部遮罩=========*/
        function openPartialLayer(obj) {

            var eheight = $(obj).css("height");//元素带px的高宽度
            var ewidth = $(obj).css("width");
            var top = $(obj).offset().top; // 元素在文档中位置 滚动条不影响
            var left = $(obj).offset().left;
            var layer = $("<div id='partialLayer'></div>");
            layer.css({
                style: 'z-index:9998',
                position: "absolute",
                height: eheight,
                width: ewidth,
                background: "black",
                top: top,
                left: left,
                filter: "alpha(opacity=60)",
                opacity: 0.6,
                borderRadius:"3px",
                dispaly: "block"
            });
            $("body").append(layer);
            return this;
        }
    };

})(jQuery);

/**
 * 描述 : 提供子窗口进行调用等待效果
 * 参数 : action : 'open' : "加载效果",'destroy' : "关闭效果"
 * 作者 :  zzg
 */
function baseLoading(action,tip){
    if( action === 'open' ){
        if( tip == '' ){
            tip = '正在加载中，请耐心等待....';
        }
        $.fn.jqLoading({
            backgroundImage: ROOT_URL + '/view/images/loadings.gif',
            height: 100,
            width: 240,
            text: tip
        });
    } else if( action === 'destroy' ) {
        $.fn.jqLoading('destroy');
    }
}

/**
 * 描述 : 含关闭、提交表单功能的弹出框
 * 参数 :
 *      show : 弹出框
 *      close : 关闭按钮
 *      sub : 提交按钮
 *      call : 提交请求地址
 * 作者 : Wade
 */
function mulReplyBox(show, close, sub, url) {
    var $showBox = $(show);
    var $closeBox = $(close);
    var $submitBtn = $(sub);

    $showBox.removeClass('displayNon');                                                                                 //打开窗口
    $submitBtn.attr('disabled', false);

    $closeBox.on('click', function () {                                                                                 //关闭按钮
        $showBox.hasClass('displayNon') || $showBox.addClass('displayNon');
    });

    $(window).keyup(function (e) {                                                                                      //esc关闭
        if (e.keyCode == 27) {
            $showBox.hasClass('displayNon') || $showBox.addClass('displayNon');
        }
    });

    $submitBtn.unbind('click');
    $submitBtn.on('click', function () {                                                                                //提交
        if (!!url) {
            $.ajax({
                url: url,
                type: 'POST',
                data: $(this.form).serializeArray(),
                dataType: 'JSON',
                beforeSend: function () {
                    $submitBtn.attr('disabled', true);
                },
                success: function (data) {
                    if (!data.info) {
                        L.open('tip')(data.msg);
                    } else {
                        var replaceKey = {total: "总数", sucNum: "成功数", failMsg: "失败ID",
                            errorInfo: "错误信息",msgId: "评价ID"};                                                      //将英文提示字段变为中文字段
                        var allSuc = data.state == 1 && data.info.total === data.info.sucNum;
                        var temp = function (dataObj) {
                            var thisFun = arguments.callee;
                            var arg = arguments[0];
                            $.each(dataObj, function (k, o) {
                                $.each(replaceKey, function (key, obj) {
                                    if (k === key) {
                                        var temp = o;
                                        delete arg[k];
                                        arg[replaceKey[key]] = temp;
                                    }
                                });
                                if ($.isArray(o) || o && o.constructor && o.constructor.name === "Object") {
                                    debugger;
                                    thisFun.call(arguments.callee, o);
                                }
                            });
                        };
                        temp(data.info);
                        if(allSuc) {
                            ajaxCallbackHint(true)(data, 'state', 'info', 1, '提交成功', '提交失败', false);
                        }else {
                            ajaxCallbackHint(true)(data, 'state', 'info', 1, '提交成功', '提交失败', 'closeBtn');
                        }
                    }
                },
                error: function () {
                    L.open('tip')('连接失败');
                },
                complete: function () {
                    $submitBtn.unbind('click');                                                                         //移除click,只允许回一次
                }
            });
        }
    });
}

/**
 * 描述 : 获取所有表单值检测所搜索条件是否符合规范
 * 参数 : [{
 *           "alone" : [{
 *               "需要限制不可单独查询字段name名称" ,
 *               ...
 *            }] ,
 *            "time" : [{
 *                "需要限制时间字段name名称" ,
 *                ...
 *            }]
 *       }]
 * 返回 : {"state": true为校验通过,false为校验失败,"info":提示文本信息}
 * 作者 : zzg
 */
function restrictSearch(obj,params){
    var thisName,thisVal;                                                                                               //当前遍历的表单的name和value
    var allName =[];                                                                                                    //所有提交的表单的name集合
    var returnName;                                                                                                     //单独字段搜索名称
    var nameValues = [];                                                                                                //所有表单的name和vale
    var result = [];                                                                                                    //最终返回结果集合
    $(obj).closest('form').find('[name]').each(function () {                                                            //遍历表格所有带有name的元素
        var $this = $(this);
        thisName = $.trim($this.attr('name'));
        thisVal = $.trim($this.val());
        if( thisVal ) {
            nameValues[thisName] = thisVal;
            allName.push(thisName);
        }
    });
    result = {"state" : true,"info" : "搜索条件通过"};
    if( $(allName).length === 1 && $.inArray(allName[0],params.alone) !== -1 ){                                         //只有一个搜索选项 看看是不是独立限制的选项
        returnName = params.aloneName[allName[0]];
        result = {"state":false,"info":returnName + "选项需要配合其它选项搜索,不能独立搜索"};
    } else {                                                                                                            //判断是否有需要限制的时间字段
        var timeStart,timeEnd,timeStartVal,timeEndVal;
        $.each(params.time,function (index,data){
            timeStart = typeof nameValues[data[0]];
            timeEnd = typeof nameValues[data[1]];
            if((timeStart !== 'undefined' && timeEnd === 'undefined') ||
                (timeStart === 'undefined' && timeEnd !== 'undefined')
            ){
                result = {"state" : false , "info" : index + "范围不能超过一个月"}
            } else if(timeStart !== 'undefined' && timeEnd !== 'undefined') {
                timeStartVal = nameValues[data[0]];
                timeEndVal = nameValues[data[1]];
                var diffTime = (Date.parse(timeEndVal) - Date.parse(timeStartVal))/3600/1000/24;                              //相差天数
                if( diffTime < 0 ){
                    result = {"state" : false , "info" : index + "开始时间不能大于结束时间"};
                }else if(diffTime > 31){
                    result = {"state" : false , "info" : index + "范围不能超过一个月"};
                }
            }
        });
    }
    return result;
}

/**
 * 描述 : 按住shift多选
 * 参数 :
 *      type : 选择框obj
 * 作者 : TigerYum.
 */
function shiftSelect(type) {
    var rem = new Array();
    $(type).click(function (e) {
        rem.push($(type).index($(this)))
        if (e.shiftKey) {
            var iMin = Math.min(rem[rem.length - 2], rem[rem.length - 1])
            var iMax = Math.max(rem[rem.length - 2], rem[rem.length - 1])
            for (var i = iMin; i <= iMax; i++) {
                $(".of-paging_body tr:eq(" + i + ") input[type=checkbox]").prop("checked", true);
            }
        } else {
            $(this).toggleClass("selected");
        }
    });
}

/**
 * 描述 : 加载二维下拉快速选择按钮
 * 作者 : Wade
 */
function select2d(trigger, triggerMethod, area, data) {
    (typeof trigger !== 'object') && (trigger = $(trigger));
    trigger.on(triggerMethod, function () {
        if ($('.select2d-p').length > 0) return;
        var top = $(this).offset().top;
        var left = $(this).offset().left + $(this).width();
        var hp = '<div class="select2d-p" style="top:' + top + 'px; left:' + left +'px">' +
            '<table class="table table-hover table-condensed textC">';
        $.each(data, function (i, v) {
            hp += '<tr><td class="select2d-p-h">' + i + '</td></tr>';
            var hc = '<div class="select2d-c displayNon" select2d="' + i + '"><ul>';
            $.each(v, function (ii, vv) {
                hc += '<li class="select2d-input">' + vv + '</li>';
            });
            hc += '</ul></div>';
            $('body').append(hc);
        });
        hp += '</table></div>';
        $('body').append(hp + '<div class="select2d-close" style="position: fixed;top:0;z-index: 199;width: 100%; ' +
            'height: ' + window.screen.height + 'px"></div>');
        //隐藏
        $('.select2d-close').on('click', function (e) {
            e.stopPropagation();
            $('.select2d-p,.select2d-c').remove();
            $(this).remove();
        });
        //二级选项
        $('.select2d-p-h').on('mouseover', function () {
            var temp = $('.select2d-c').not('.displayNon');
            temp.length > 0 && temp.addClass('displayNon');
            var top = $(this).offset().top;
            var left = $(this).offset().left + $(this).width() + 15;
            $('.select2d-c[select2d="' + $(this).html() + '"]').removeClass('displayNon').css({top: top, left:left});
        });
        //选项填充
        $('.select2d-input').on('click', function () {
            trigger.val($(this).html());
            (typeof area !== 'object') && (area = $(area));
            area.val($(this).html());
            $('.select2d-close').click();
        });
    });
}

/**
 * 描述 : 对当前元素填充二维下拉快速选择值
 * 作者 : Wade
 */
function popSelect2d(obj, data) {
    $(obj).parent().append('<input class="form-control input-group-sm text-red select2d-btn" type="button" value="-- 选择原因 --">');
    select2d($(obj).parent().find('.select2d-btn'), 'click', $(obj), data);
    $(obj).hide();
}
/**
 * 描述 : ups物流查询
 * 作者 : Kevin
 */
function trackUps() {
    var trackNumber = $('input[name="upsNumber"]').val();
    var temp_form = document.createElement("form");
    temp_form.action = 'https://wwwapps.ups.com/WebTracking/track';
    temp_form.target = "_blank";
    temp_form.method = "post";
    temp_form.style.display = "none";

    var opt = document.createElement("textarea");
    opt.name = 'loc';
    opt.value = 'en_HK';
    temp_form.appendChild(opt);
    var opt = document.createElement("textarea");
    opt.name = 'HTMLVersion';
    opt.value = '5.0';
    temp_form.appendChild(opt);
    var opt = document.createElement("textarea");
    opt.name = 'USER_HISTORY_LIST';
    opt.value = '';
    temp_form.appendChild(opt);
    var opt = document.createElement("textarea");
    opt.name = 'trackNums';
    opt.value = trackNumber;
    temp_form.appendChild(opt);
    var opt = document.createElement("textarea");
    opt.name = 'track.x';
    opt.value = 'Track';
    temp_form.appendChild(opt);
    document.body.appendChild(temp_form);
    temp_form.submit();
}


/**
 * 描述 : yw56物流查询
 * 作者 : Kevin
 */
function yw56() {
    var trackNumber = $('input[name="InputTrackNumbers"]').val();
    var temp_form = document.createElement("form");
    temp_form.action = 'http://track.yw56.com.cn/en-US/';
    temp_form.target = "_blank";
    temp_form.method = "post";
    temp_form.style.display = "none";

    var opt = document.createElement("textarea");
    opt.name = 'InputTrackNumbers';
    opt.value = trackNumber;
    temp_form.appendChild(opt);
    document.body.appendChild(temp_form);
    temp_form.submit();
}

/**
 * 描述 : 填写值到对应的输入框里面
 * 作者 : Zoro.Zhu
 */
function inputContentInfo(text,id){
    $('#'+id).insertContent(text);
}

/**
 * 描述 : 根据光标填写内容
 * 作者 : Zoro.Zhu
 */
$(function() {
    /* 在textarea处插入文本--Start */
    (function($) {
        $.fn.extend({
            insertContent : function(myValue, t) {
                var $t = $(this)[0];
                if (document.selection) { // ie
                    this.focus();
                    var sel = document.selection.createRange();
                    sel.text = myValue;
                    this.focus();
                    sel.moveStart('character', -l);
                    var wee = sel.text.length;
                    if (arguments.length == 2) {
                        var l = $t.value.length;
                        sel.moveEnd("character", wee + t);
                        t <= 0 ? sel.moveStart("character", wee - 2 * t - myValue.length) : sel.moveStart( "character", wee - t - myValue.length);
                        sel.select();
                    }
                } else if ($t.selectionStart
                    || $t.selectionStart == '0') {
                    var startPos = $t.selectionStart;
                    var endPos = $t.selectionEnd;
                    var scrollTop = $t.scrollTop;
                    $t.value = $t.value.substring(0, startPos)
                        + myValue
                        + $t.value.substring(endPos,$t.value.length);
                    this.focus();
                    $t.selectionStart = startPos + myValue.length;
                    $t.selectionEnd = startPos + myValue.length;
                    $t.scrollTop = scrollTop;
                    if (arguments.length == 2) {
                        $t.setSelectionRange(startPos - t,
                            $t.selectionEnd + t);
                        this.focus();
                    }
                } else {
                    this.value += myValue;
                    this.focus();
                }
            }
        })
    })(jQuery);
    /* 在textarea处插入文本--Ending */
});

/**
 * 描述 : 用于点击模板按钮,显示模板信息
 * 参数 :
 *      platformType: 模板的平台标识
 * 作者 : Kevin
 */
function getTemplate(platformType) {
    var templateIframe = $('.templateIframe');
    if (platformType && templateIframe.hasClass('displayNon')) {                                                                      //有平台标识
      var src = "http://oms.yafex.cn/index.php?c=show_infoMgmt_template&a=getTemplate&platform=" + platformType;
      //本地调试模板
//      var src = "http://localhost/yafex/index.php?c=show_infoMgmt_template&a=getTemplate&platform=" + platformType;
      var $iframe = $('<iframe class="templateIframeShow" id="templateIframeShow" style="width:100%;height:100%;border:solid 1px #ddd;" src="' +
          src + '"></iframe>');
      templateIframe.html($iframe);
      var wrapper = $('<div class="pop-big-info"></div>');
      var closeImage = $('<div class="positionA textC close-image" ' +
          'onclick="popBigInfo(\'close\',this)">×</div>');
      wrapper.append(closeImage);
      templateIframe.append(wrapper);
      templateIframe.removeClass('displayNon');
    }
    templateIframe.show();
    templateIframe.on('click', function (e) {                                                                             //点击灰色背景关闭
        e.stopPropagation();
        $(this).hide();
    });
    $(window).keyup(function (e) {
        if (e.keyCode == 27) {
            templateIframe.hide();
        }
    });
}
//tab切换
tabSwitch('.jsTabSwitch');

//计算签名方法调用
function a(r, o) {
    for (var t = 0; t < o.length - 2; t += 3) {
        var a = o.charAt(t + 2);
        a = a >= "a" ? a.charCodeAt(0) - 87 : Number(a), a = "+" === o.charAt(t + 1) ? r >>> a : r << a, r = "+" === o.charAt(t) ? r + a & 4294967295 : r ^ a
    }
    return r
}

var C = null;
/**
 * 描述：百度的获取签名的方法
 * **/
var hash = function (r, _gtk) {
    var o = r.length;
    o > 30 && (r = "" + r.substr(0, 10) + r.substr(Math.floor(o / 2) - 5, 10) + r.substr(-10, 10));
    var t = void 0, t = null !== C ? C : (C = _gtk || "") || "";
    for (var e = t.split("."), h = Number(e[0]) || 0, i = Number(e[1]) || 0, d = [], f = 0, g = 0; g < r.length; g++) {
        var m = r.charCodeAt(g);
        128 > m ? d[f++] = m : (2048 > m ? d[f++] = m >> 6 | 192 : (55296 === (64512 & m) && g + 1 < r.length && 56320 === (64512 & r.charCodeAt(g + 1)) ? (m = 65536 + ((1023 & m) << 10) + (1023 & r.charCodeAt(++g)), d[f++] = m >> 18 | 240, d[f++] = m >> 12 & 63 | 128) : d[f++] = m >> 12 | 224, d[f++] = m >> 6 & 63 | 128), d[f++] = 63 & m | 128)
    }
    for (var S = h, u = "+-a^+6", l = "+-3^+b+-f", s = 0; s < d.length; s++) S += d[s], S = a(S, u);
    return S = a(S, l), S ^= i, 0 > S && (S = (2147483647 & S) + 2147483648), S %= 1e6, S.toString() + "." + (S ^ h)
}

function icon (obj) {
    $(obj).each(function () {
        var $this = $(this);
        var type = $this.attr('data-type');
        var val = $this.attr('data-value');
        var pxx = 0, pxy = 0;
        if (val >= 0 && val <= 5) {
            switch (type) {
                case 'sm-star':
                    pxx = -5 - ( 5 - parseInt(val)) * 16;
                    pxy = -368;
                    $this.css({'width': '80px', 'height': '18px', 'margin-top': '3px', 'margin-left': '3px'});
                    break;
                case 'md-star':
                    if (val % 1 >= 0.5) {
                        pxx = -205 - ( 4 - parseInt(val)) * 19;
                    } else {
                        pxx = -5 - ( 5 - parseInt(val)) * 19;
                    }
                    pxy = -394;
                    $this.css({'width': '95px', 'height': '21px', 'margin-right': '1px', 'top': '-2px'});
                    break;
            }
            $this.css('background-position', pxx + 'px ' + pxy + 'px');
        }
    });
}


