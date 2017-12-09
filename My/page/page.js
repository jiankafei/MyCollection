/*
*使用：
pgBox.zPages({
	obj:sel,//内容盒子选择器,
	tips:sel,//提示盒子选择器
	tipsWords:{
		noResult:,//空结果
		wrong://错误
	}//提示语
	perNum:,//每一页的个数
	type:,//样式类型,lv1 || lv2 || lv3,默认lv1
	ajaxOpts:{//ajax参数
		url:'path',
		type:'get' || 'post',
		data:{}
	},
	status:function(data){},//在这里返回状态,true || false || 'null' ||
	dataList:function(data){},//在这里返回数据列表
	itemContent:function(itemData){},//在这里返回内容item
	done:function(){},//成功的回掉
	fail:function(){}//失败的回掉
});
*/
(function ($) {
	$.fn.zPages = function (json) {
		$('<link rel="stylesheet" type="text/css" href="/js/page/page.css">').appendTo('head');
		if (!json.obj || !json.ajaxOpts.url) return;

		var _this = this,
			$obj = $(json.obj),
			$tips = $(json.tips),
			noResultTips = json.tipsWords ? (json.tipsWords.noResult || '暂无内容') : '暂无内容',
			wrongTips = json.tipsWords ? (json.tipsWords.wrong || '出错，请重试！') : '出错，请重试！',
			status = json.status || null,
			dataList = json.dataList || null,
			itemContent = json.itemContent || null,
			done = json.done,
			fail = json.fail,
			frag = document.createDocumentFragment(),
			ajaxOpts = json.ajaxOpts,
			perNum = json.perNum || 10,
			page = 1, //页码
			pageNum, //总页数
			total, //总条数
			$pn = $('.pg-num') || null,
			$icon = $('.pg-loadIcon'),
			isloading = false, //状态锁
			str = '';
		console.log($tips);
		switch (json.type || 'lv1') {
			case 'lv1':
				str = '<div class="pg-lv1 pg"><a class="pg-prev">上一页</a><a class="pg-next">下一页</a></div>';
				break;
			case 'lv2':
				str = '<div class="pg-lv2 pg"><a class="pg-ft">首页</a><a class="pg-prev">上一页</a><a class="pg-num">1 / 1</a><a class="pg-next">下一页</a><a class="pg-lt">末页</a><i class="pg-loadIcon"></i></div>';
		};

		function createNumBtn(num) {
			var str = '',
				tmp = (7 - (pageNum - num)) <= 3 ? 3 : (7 - (pageNum - num));
			if (num != 1) {
				str += '<a class="pg-prev" href="javascript:;"><</a>';
			}
			if (num <= 5) {
				for (var i = 1; i < num; i++) {
					str += '<a class="pg-per" href="javascript:;">' + i + '</a>';
				}
				str += '<span class="pg-cur">' + num + '</span>';
				if (pageNum <= 9) {
					for (var i = num + 1; i <= pageNum; i++) {
						str += '<a class="pg-per" href="javascript:;">' + i + '</a>';
					}
				} else {
					for (var i = num + 1; i <= 9; i++) {
						str += '<a class="pg-per" href="javascript:;">' + i + '</a>';
					}
					str += '<span class="pg-split">···</span><a class="pg-per" href="javascript:;">' + pageNum + '</a>';
				}
			} else {
				str += '<a class="pg-per" href="javascript:;">1</a><span class="pg-split">···</span>';

				for (var i = num - tmp; i < num; i++) {
					str += '<a class="pg-per" href="javascript:;">' + i + '</a>';
				}
				str += '<span class="pg-cur">' + num + '</span>';
				if (pageNum <= 9) {
					for (var i = num + 1; i <= pageNum; i++) {
						str += '<a class="pg-per" href="javascript:;">' + i + '</a>';
					}
				} else {
					if (num + 3 >= pageNum) {
						for (var i = num + 1; i <= pageNum; i++) {
							str += '<a class="pg-per" href="javascript:;">' + i + '</a>';
						}
					} else {
						for (var i = num + 1; i <= num + 3; i++) {
							str += '<a class="pg-per" href="javascript:;">' + i + '</a>';
						}
						str += '<span class="pg-split">···</span><a class="pg-per" href="javascript:;">' + pageNum + '</a>';
					}
				}
			}
			if (num != pageNum) {
				str += '<a class="pg-next" href="javascript:;">></a>';
			}
			str = '<div class="pg-lv3 pg">' + str + '</div>';
			return str;
		};
		var $pg = $(str);
		$pg.appendTo(this);

		$(this).on('click', function (event) {
			var tg = event.target;
			if (isloading) {
				return false;
			}
			$icon.css('display', 'inline-block');
			var cn = $(tg).attr('class'); //判断是那个按钮
			switch (cn) {
				case 'pg-ft':
					isloading = true;
					page = 1;
					break;
				case 'pg-prev':
					isloading = true;
					page--;
					page < 1 && (page = 1);
					break;
				case 'pg-next':
					isloading = true;
					page++;
					page > pageNum && (page = pageNum);
					break;
				case 'pg-lt':
					isloading = true;
					page = pageNum;
					break;
				case 'pg-per':
					isloading = true;
					page = ~~tg.innerHTML;
			}
			// ajaxOpts.data.p = page;
			getPage(page); //创建内容
		});
		//初始加载第一页
		getPage(1);

		function getPage(page) {
			ajaxOpts.data.p = page;
			$.ajax(ajaxOpts)
				.done(function (data) {
					isloading = false;
					if (status) {
						var state = status(data);
						if (state === 'null') {
							$tips.html(noResultTips).css('display', 'block');
							$obj.css('display', 'none');
							return false;
						}
						if (!state) {
							$tips.html(wrongTips).css('display', 'block');
							$obj.css('display', 'none');
							return false;
						}
						$tips.css('display', 'none');
						$obj.css('display', 'block');
					}
					total = ~~data.data.total; //总评论数
					if (total === 0) {
						return false;
					}
					if (total > perNum) {
						pageNum = Math.ceil(total / perNum); //总页数
						str = createNumBtn(page);
						var $pg = $(str);
						_this.html('');
						$pg.appendTo(_this);
					}
					var list = dataList(data);
					if (list) {
						for (var i = 0, l = list.length; i < l; i++) {
							frag.appendChild(createMsg(list[i]));
						};
					}
					$obj.html('');
					$obj[0].appendChild(frag);
					done && done();
				})
				.fail(function () {
					isloading = false;
					fail && fail();
					$tips && $tips.html('网络开小差了！');
				})
				.always(function () {
					$icon.css('display', 'none');
				});
		};
		//创建评论
		function createMsg(item) {
			if (itemContent) {
				return $(itemContent(item))[0] || document.createElement('span');
			};
		};
	};
})(jQuery);
