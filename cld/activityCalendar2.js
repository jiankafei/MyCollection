$(function(){
    var nowM = 0,
        year = 0,
        month = 0,
        initday = 0, //用来存放访问月的天
        initNowM = 0, //用来存放访问月的nowM
        preBtn = null,
        nowDate = null,
        nextBtn = null,
        dayWp = null,
        weekendfirst = true; // 每周的第一天是周日还是周一
        cld = document.querySelector('.cld'),
        ct = document.querySelector('.content'),
        gettingData = false, //是否在请求数据
        dealedData = {}, //处理后的数据
        initActivityDay = 0, //显示活动列表的天，默认为有活动的第一天
        flagData = {}, //是否去过的数据
        eventName = 'touchend'; //事件名，为了兼容移动和pc
        isApp = window.isApp;
    //初始化年月
    var date = window.date,
        hasDate = false; //是否有默认日期
    if(date){
        hasDate = true;
        var tempDate = date.split(' ')[0].split('-');
        year = ~~tempDate[0];
        month = ~~tempDate[1];
        initday = ~~tempDate[2];
        initActivityDay = initday;
    }else{
        var date = getYM();
        year = date.y;
        month = date.m;
    }
    //初始化nowM
    initNowMFn();

    if('touchend' in window === false){
        eventName = 'click';
    }
    cld.addEventListener(eventName, touch, false);
    createCalendar(cld);

    //touch句柄函数
    function touch(ev){
        var ev = ev || window.event;
            tg = ev.target,
            cl = tg.classList;
        ev.preventDefault();
        if(cl.contains('pre')){
            if(gettingData){
                return false;
            }
            gettingData = true;
            --nowM;
            var date = getYM();
            year = date.y;
            month = date.m;
            ajaxData(dd);
            //dd();
        }else if(cl.contains('next')){
            if(gettingData){
                return false;
            }
            gettingData = true;
            ++nowM;
            var date = getYM();
            year = date.y;
            month = date.m;
            ajaxData(dd);
            //dd();
        }else if(cl.contains('activity')){
            var num = tg.getAttribute('data-day'),
                onObj = document.querySelector('.on');
            //点击效果
            onObj && onObj.classList.remove('on');
            tg.classList.add('on');
            //生成内容列表
            createActivityList(ct, num);
        }
        //console.log(year, month);
    };
    //获取数据
    function ajaxData(cb){
        $.ajax({
            url: '/YearCard/ajaxCalendarList',
            data: {
                year: year,
                month: month,
                cardId: window.cardId,
                userId: window.userId
            },
            dataType: 'json',
            timeout: 5000,
            success: function(data){
                dealedData = {};
                flagData = {};
                if(~~data.status === 1){
                    var data = data.data || {};
                    if(data.length > 0){
                        data.forEach(function(item, index, arr){
                            var num = ~~Math.floor(item.date.split(' ')[0].split('-')[2]);
                            //设置initActivityDay
                            if(!initActivityDay){
                                initActivityDay = num;
                            }
                            //处理数据
                            if(dealedData[num]){
                                dealedData[num].push(item);
                            }else{
                                dealedData[num] = [item];
                            }
                            //处理去过数据
                            flagData[num] = false;
                            if(~~item.isVerify === 1){
                                flagData[num] = true;
                            }
                        });
                        //如果是当月则重新设置的默认的initActivityDay
                        if(nowM === 0){
                            if(hasDate){
                                initActivityDay = initday;
                            }else{
                                var date = new Date(),
                                    todayNum = ~~date.getDate();
                                for(var num in dealedData){
                                    if(~~num >= todayNum){
                                        initActivityDay = ~~num;
                                        break;
                                    }
                                }
                            }
                        }
                        //如果是访问月，则设置initActivityDay为访问月的day
                        if(nowM === initNowM && hasDate){
                            initActivityDay = initday;
                        }
                    }
                    //console.log(initActivityDay);
                    //执行回掉
                    cb();
                    //每次切换后initActivityDay重置到0
                    initActivityDay = 0;
                }else{
                    alert(data.message);
                }
            },
            error: function(error){
                console.log(error);
            },
            complete: function(){
                gettingData = false;
            }
        });
    };
    //创建活动列表
     function createActivityList(ct, num){
        var fg = document.createDocumentFragment(),
            ct = ct,
            num = num;
        ct.innerHTML = '';
        if(dealedData[num]){
            dealedData[num].forEach(function(value, key, arr){
                var item = document.createElement('a');
                item.className = 'item';
                //添加小旗子
                var oI = '';
                if(~~value.isVerify === 1){
                    oI = '<i class="flag"></i>';
                }
                //设置查看详情链接
                var addrLink = '/YearCard/activityDetail/itemId/' + value.item_id;
                if(isApp){
                    addrLink = "javascript:openNative('appTarget://cardActivityInfo/id="+value.activity_id+"')";
                }
                item.href = addrLink;
                item.innerHTML = '<div class="header">\
                                    <div class="titlebar"><span class="title elp">'+value.name+'</span><span class="derate">减免 ￥'+value.par_value+'</span></div>\
                                    <div class="labelbar">\
                                        <span class="show-num">'+value.comment_num+'场现场秀</span>\
                                        <span class="want-num">'+value.recomment_num+'人想去</span>\
                                    </div>\
                                    <img src="'+value.image_url+'" alt="'+value.name+'">'+oI+'\
                                </div>\
                                <p class="txt flex-box">'+value.descript+'</p>\
                                <div class="viewBtn">查看详情</div>';
                fg.appendChild(item);
            });
            ct.appendChild(fg);
        }
     };
    //创建日历
    function createCalendar(cld){
        var fg = document.createDocumentFragment(),
            cld = cld;
        //创建switchBar
        var switchBar = document.createElement('div');
        switchBar.className = 'switchBar flex-box';

        preBtn = document.createElement('a');
        nowDate = document.createElement('span');
        nextBtn = document.createElement('a');

        preBtn.className = 'pre';
        preBtn.href = 'javascript:;';

        nowDate.className = 'now flex-1';

        nextBtn.className = 'next';
        nextBtn.href = 'javascript:;';

        //设置初始年月
        changeDate();

        switchBar.appendChild(preBtn);
        switchBar.appendChild(nowDate);
        switchBar.appendChild(nextBtn);
        //创建week
        var weekBar = document.createElement('div');
        weekBar.className = 'weekBar flex-box flex-justify-between';
        if (weekendfirst) {
            weekBar.innerHTML = '<div class="weekend">日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div class="weekend">六</div>';
        } else {
            weekBar.innerHTML = '<div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div class="weekend">六</div><div class="weekend">日</div>';
        }

        //创建dayWp
        dayWp = document.createElement('div');
        //dayWp.className = 'dayWp flex-box flex-wrap flex-justify-between';
        dayWp.className = 'dayWp';
        ajaxData(dd);
        //dd();
        //fg添加元素
        fg.appendChild(switchBar);
        fg.appendChild(weekBar);
        fg.appendChild(dayWp);
        //cld添加fg
        cld.appendChild(fg);
    };
    //获取年月
    function getYM(){
        var date = setAnotherMonth(nowM);
        return {
            y: date.getFullYear(),
            m: date.getMonth() + 1,
            dateObj: date
        };
    };
    //创建空日期
    function createSpaceBox(){
        var fg1 = document.createDocumentFragment(),
            fg2 = document.createDocumentFragment(),
            gap1 = setAnotherMonth(nowM).getDay(),
            gap2,
            daysNum;
        //获取gap1
        if(gap1 === 0){gap1 = 7;}
        if (!weekendfirst) {
            --gap1;
        }
        //获取gap2
        daysNum = getDaysNum(nowM);
        gap2 = 42 - gap1 - daysNum;
        //创建fg1
        var preMonthNum = getDaysNum(nowM - 1);
        for(var i = 0; i < gap1; i++){
            var item = document.createElement('div');
            item.className = 'empty flex-inline-box';
            item.className = 'empty flex-inline-box';
            item.textContent = preMonthNum - gap1 + i + 1;
            fg1.appendChild(item);
        }
        //创建fg2
        for(var i = 0; i < gap2; i++){
            var item = document.createElement('div');
            item.className = 'empty flex-inline-box';
            item.textContent = i + 1;
            fg2.appendChild(item);
        }
        return [fg1,fg2];
        //return fg1;
    };
    //创建日期
    function createDays(){
        var daysNum = getDaysNum(nowM),
            fg = document.createDocumentFragment();
        for(var i = 0; i < daysNum; i++){
            var item = document.createElement('div');
            item.className = 'day flex-inline-box flex-justify-center flex-alignItem-center';
            item.textContent = i + 1;
            item.setAttribute('data-day', i + 1);
            fg.appendChild(item);
        }
        return fg;
    };
    //设置到下n个月的第一天
    function setAnotherMonth(num){
        var date = new Date();
        date.setMonth(date.getMonth() + num, 1);
        return date;
    };
    //获取每月的天数
    function getDaysNum(num){
        var date = new Date();
        date.setMonth(date.getMonth() + num + 1, 0);
        return date.getDate();
    }
    //添0
    function addZero(n){
        return n<10 ? '0'+n : ''+n;
    };
    //切换创建日期
    function dd(){
        dayWp.innerHTML = '';
        var fg = document.createDocumentFragment(),
            spaceBox = createSpaceBox(),
            days = createDays();
		fg.appendChild(spaceBox[0]);
        fg.appendChild(createDays());
        fg.appendChild(spaceBox[1]);
        //设置状态
        setState(fg);
        //添加fg
        dayWp.appendChild(fg);
        //改变日期
        changeDate();
        //添加活动列表
        ct.innerHTML = '';
        if(initActivityDay !== 0){
            createActivityList(ct, initActivityDay);
        }
    };
    //改变switchBar日期显示
    function changeDate(){
        var date = getYM(),
            y = ~~date.y,
            m = ~~date.m;
        preBtn.textContent = '<' + addZero(m-1 === 0 ? 12 : m-1) + '月';
        nowDate.textContent = y + '年' + m + '月';
        nextBtn.textContent = addZero(m+1 === 13 ? 1 : m+1) + '月>';
    };
    //初始化nowM
    function initNowMFn(){
        var date = new Date();
		nowM = ~~(year - date.getFullYear()) * 12 + (month - date.getMonth() - 1);
        initNowM = nowM;
    };
    //设置日历内的各种状态
    function setState(fragment){
        var days = Array.prototype.slice.call(fragment.children || fragment.childNodes),
            date = new Date(),
            today = ~~date.getDate();
        days.forEach(function(item, index, arr) {
            var num = ~~item.getAttribute('data-day') || 0;
            if (num !== 0) {
                //添加weekDay
                if (weekendfirst) {
                    if(index % 7 === 0 || index % 7 === 6){
                        item.classList.add('weekDay');
                    }
                } else {
                    if(index % 7 === 5 || index % 7 === 6){
                        item.classList.add('weekDay');
                    }
                }
                //添加本月的今天和以前的状态
                if (nowM === 0) {
                    if (num === today) {
                        item.classList.add('today');
                    } else if(num < today){
                        item.classList.add('before');
                    }
                };
                //添加前月状态
                if (nowM < 0) {
                    item.classList.add('before');
                };
            }

            //添加活动状态
            if(num in dealedData){
                item.classList.add('activity');
            }
            //添加去过小旗子
            if(num in flagData && flagData[num]){
                item.classList.add('flag');
            }
            //添加默认显示内容的日期状态
            if(num === initActivityDay){
                item.classList.add('on');
            }
        });
    };
});
