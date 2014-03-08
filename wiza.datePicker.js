/* *
 * ---------------------------------------- *
 * 时间选择空间
 * Author: wiza Li
 * Mail: wiza.li@gmail.com
 * ---------------------------------------- *
 * */

var picker = {};

picker._m = {
	$: function(c, context) {
		var tags = [];
		context = context || document;
		if (typeof c == "string") {
			var t = c.substring(1);
			switch (c.charAt(0)) {
				case "#":
					return context.getElementById(t);
					break;
				case ".":
					if (context.getElementsByClassName) {
						return context.getElementsByClassName(t);
					}
					tagAll = picker._m.$("*", context);
					n = tagAll.length;
					for (var i = 0; i < n; i++) {
						if (tagAll[i].className.indexOf(t) > -1) {
							tags.push(tagAll[i]);
						}
					}
					return tags;
					break;
				default:
					return context.getElementsByTagName(c);
					break;
			}
		}
	},
	on: function(type, node, handler) {
		node.addEventListener ? node.addEventListener(type, handler, false) : node.attachEvent(type, handler);
	},
	getTarget: function(e) {
		return e.target || e.srcElement;
	},
	getPosition: function(node) {
		var scrollx = document.documentElement.scrollLeft || document.body.scrollLeft,
			scrolly = document.documentElement.scrollTop || document.body.scrollTop;
		var post = node.getBoundingClientRect();
		return {
			top: post.top + scrolly,
			left: post.left + scrollx,
			bottom: post.bottom + scrolly,
			right: post.right + scrollx
		}
	},
	hasClass: function(className, node) {
		if (!node) {
			return false;
		}
		return node.className.indexOf(className) > -1;
	},
	addClass: function(className, nodes) {
		for (var i = 0, l = nodes.length; i < l; i++) {
			if (!nodes[i]) {
				return false;
			}
			var c = nodes[i];
			c.className = picker._m.hasClass(className, c) ? c.className : c.className + " " + className;
		}
	},
	removeClass: function(className, nodes) {
		for (var i = 0, l = nodes.length; i < l; i++) {
			if (!nodes[i]) {
				return false;
			}
			var c = nodes[i];
			var reg = new RegExp("(^|\\s+)" + className + "(\\s+|$)", "g");
			c.className = reg.test(c.className) ? c.className.replace(reg, '') : c.className;
		}

	},
	stopPropagation: function(e) {
		e = e || window.e;
		e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
	},
	getNowYear: function() {
		return new Date().getFullYear();
	}
}

picker.datePicker = function() {
	this.init.apply(this, arguments);
}

picker.datePicker.prototype = {
	constructor: picker.datePicker,
	input: "",
	monthView: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
	max : "",
	min : "",
	validate: false,
	width: "",
	mainWidth: 250,
	height: "",
	subDivId: null, //包含三个input框的div
	rootDivId: null, //整个日期选择框的div
	yearId: null,
	monthId: null,
	dayId: null,
	selectedYear: null,
	selectedMonth: null,
	selectedDay: null,
	subDiv: null,
	rootDiv: null,
	yearDiv: null,
	monthDiv: null,
	dayDiv: null,
	activeInput: null,
	init: function(options) {
		for (k in options) {
			this[k] = options[k];
		}
		var id = options.id;
		this.input = picker._m.$("#" + id);
		this.rootDivId = id + "_rootDiv";
		this.subDivId = id + "_subDiv";
		this.yearId = id + "_year";
		this.monthId = id + "_month";
		this.dayId = id + "_day";

		this.addDatePicker();
	},
	addDatePicker: function() {
		var that = this,
			m = picker._m,
			id = this.input.getAttribute("id"),
			h = (this.input.style.height-2),
			width = that.width == "" ? that.input.style.width : that.width,
			w = (parseFloat(width.replace(/[a-z].*|[A-Z].*/g, ""), 10)-10) / 3,
			w = w < 29 ? 30 : w,
			w_div = (w-2),
			w_input = (w - 45) <= 0 ? (w-3) : (w - 20),
			_div = that.subDiv = document.createElement("div"),
			_html = "<div class='w_datePicker_div_sub' id='" + id + "_yearDiv' style='width:" + w_div + "px'><input type='text' id='" + this.yearId + "' style='width:" + w_input + "px' value='年'/></div>" +
				"<div class='w_datePicker_div_sub' id='" + id + "_monthDiv' style='width:" + w_div + "px'><input type='text' id='" + this.monthId + "' style='width:" + w_input + "px' value='月'/></div>" +
				"<div class='w_datePicker_div_sub' id='" + id + "_dayDiv' style='width:" + w_div + "px'><input type='text' id='" + this.dayId + "' style='width:" + w_input + "px' value='日'/></div>";

		_div.setAttribute("id", that.subDivId);
		_div.style.height = h;
		_div.className = "w_subdiv";
		_div.innerHTML = _html;
		this.input.appendChild(_div);

		m.on("click", document, function(e) {
			var target = picker._m.getTarget(e);
			if (target == that.yearDiv || target == that.monthDiv || target == that.dayDiv) {
				return false;
			}
			that.clearAll();
		});

		var inputArr = [m.$("#" + this.yearId), m.$("#" + this.monthId), m.$("#" + this.dayId)];
		var divArr = [m.$("#" + id + "_yearDiv"), m.$("#" + id + "_monthDiv"), m.$("#" + id + "_dayDiv")];
		for (var i = 0, l = inputArr.length; i < l; i++) {
			m.on("click", divArr[i], (function(e) {
				var t = i;
				var evn = e;
				return function(evn) {
					that.activeInput = inputArr[t];
					that.clearAll();
					that.drawRootDiv(t + 1);
					m.stopPropagation(evn);
				}
			})());
		}
	},
	drawRootDiv: function(bj) {
		var m = picker._m,
			_div = this.rootDiv = document.createElement("div"),
		post = this.rootDivPost = m.getPosition(this.activeInput);
		_div.setAttribute("id", this.rootDivId);
		_div.className = "w_datePicker_div";
		_div.style.top = (post.bottom + 1) + "px";
		_div.style.left = post.left + "px";

		window.document.body.appendChild(_div);
		// this.input.appendChild(_div);
		this.rootDivPost = m.getPosition(this.rootDiv);

		switch (bj) {
			case 1:
				this.drawYearDiv();
				break;
			case 2:
				this.drawMonthDiv();
				break;
			case 3:
				this.drawDayDiv();
				break;
		}
	},
	drawYearDiv: function() {
		var _div = this.yearDiv = document.createElement("div");
		_div.className = "w_datePicker_div w_div_content";
		this.drawYearUl();
	},
	drawYearUl: function() {
		var m = picker._m,
			_div = this.yearDiv,
			_ul = document.createElement("ul"),
			nowYear = m.getNowYear(),
			_html = "<li name='年' class='w_picker_li'>年</li>";

		for (var i = nowYear; i > 1900; i--) {
			_html += "<li name='" + (i) + "' class='w_picker_li'>" + (i) + "<span class='w_picker_li_span w_picker_li_span_hide'></span></li>";
		}
		_ul.innerHTML = _html;
		_ul.className = "w_datepicker_ul";
		this.addListener(_ul, "year");

		_div.appendChild(_ul);
		this.rootDiv.appendChild(_div);
	},
	drawMonthDiv: function() {
		var m = picker._m,
			post = this.rootDivPost;
		if (this.monthDiv != null) {
			return false;
		}

		var _div = this.monthDiv = document.createElement("div");
		_div.className = "w_datePicker_div w_div_content";
		_div.style.top = "0px";
		_div.style.left = this.yearDiv ? "86px" : "0px";
		this.drawMonthUl();
	},
	drawMonthUl: function() {
		var _div = this.monthDiv,
			_ul = document.createElement("ul"),
			_html = "<li name='月' class='w_picker_li'>月</li>";

		for (var i = 0; i < this.monthView.length; i++) {
			_html += "<li name='" + (i + 1) + "' class='w_picker_li'>" + this.monthView[i] + "<span class='w_picker_li_span w_picker_li_span_hide'></span></li>";
		}
		_ul.innerHTML = _html;
		_ul.className = "w_datepicker_ul";
		this.addListener(_ul, "month");
		_div.appendChild(_ul);
		this.rootDiv.appendChild(_div);
	},
	drawDayDiv: function() {
		var m = picker._m,
			post = picker._m.getPosition(this.selectedMonth || this.rootDiv);

		if (this.dayDiv != null) {
			this.rootDiv.removeChild(this.dayDiv);
		}

		var _div = this.dayDiv = document.createElement("div");
		_div.className = "w_datePicker_div w_div_content";
		_div.style.top = "0px";
		_div.style.left = this.yearDiv ? "172px" : (this.monthDiv ? "86px" : "0px");
		this.drawDayUl();
	},
	drawDayUl: function() {
		var m = picker._m,
			_div = this.dayDiv,
			_ul = document.createElement("ul"),
			mon = new Date().getMonth(),

			y = this.selectedYear == null ? (m.$("#" + this.yearId).value == ("" || "年") ? new Date().getFullYear() : m.$("#" + this.yearId).value) : this.selectedYear.getAttribute("name");
		mo = this.selectedMonth == null ? (m.$("#" + this.yearId).value == ("" || "年") ? (mon > 9) ? mon : (mon + 1) : m.$("#" + this.yearId).value) : this.selectedMonth.getAttribute("name");
		d = new Date(y, mo, 0).getDate(),
		_html = "<li name='日' class='w_picker_li'>日</li>";

		for (var i = 0; i < d; i++) {
			_html += "<li name='" + (i + 1) + "' class='w_picker_li'>" + (i + 1) + "</li>";
		}

		_ul.innerHTML = _html;
		_ul.className = "w_datepicker_ul";
		this.addListener(_ul, "day");
		_div.appendChild(_ul);
		if (this.selectedDay != null) {
			var sd = this.selectedDay.getAttribute("name");
			for (var j = 0, q = _ul.childNodes.length; j < q; j++) {
				var _li = _ul.childNodes[j];
				if (_li.getAttribute("name") == sd) {
					m.addClass("w_li_hover", [_li]);
				}
			}
		}
		this.rootDiv.appendChild(_div);
	},
	addListener: function(c, bj) {
		var m = picker._m,
			that = this;
		m.on("mouseover", c, function(e) {
			var target = m.getTarget(e),
				_ulArr = target.parentNode.childNodes,
				_span = target.childNodes[1];

			// var preArr = target.previousSibling == null ? [] : target.previousSibling.childNodes;
			// var nexArr = target.nextSibling == null ? [] : target.nextSibling.childNodes;

			if (target.nodeName.toLowerCase() == "li") {
				var re = e.relatedTarget.childNodes;
				m.removeClass("w_picker_li_span_view", re);
			}

			m.removeClass("w_li_hover", _ulArr);
			m.addClass("w_picker_li_span_hide", m.$("span", target.parentNode));
			m.addClass("w_li_hover", [target]);
			m.removeClass("w_picker_li_span_hide", [_span]);
			m.addClass("w_picker_li_span_view", [_span]);
			switch (bj) {
				case "year":
					that.selectedYear = target;
					if (target.nodeName.toLowerCase() == "span") {
						that.selectedYear = target.parentNode;
						m.removeClass("w_picker_li_span_hide", [target]);
						m.addClass("w_picker_li_span_view", [target]);
						that.drawMonthDiv();
					}
					break;
				case "month":
					that.selectedMonth = target;
					if (target.nodeName.toLowerCase() == "span") {
						that.selectedMonth = target.parentNode;
						m.removeClass("w_picker_li_span_hide", [target]);
						m.addClass("w_picker_li_span_view", [target]);
						that.drawDayDiv();
					}
					break;
				case "day":
					that.selectedDay = target;
					if (target.nodeName.toLowerCase() == "span") {
						that.selectedYear = target.parentNode;
					}
					break;
			}
			e.stopPropagation(e);
		});

		m.on("click", c, function(e) {
			var target = m.getTarget(e);
			that.setValue();
			that.clearAll();
			m.stopPropagation(e);
		});
	},
	clearAll: function() {
		if (this.rootDiv) {
			window.document.body.removeChild(this.rootDiv);
			// this.input.removeChild(this.rootDiv);
			this.rootDiv = null;
			this.yearDiv = null;
			this.monthDiv = null;
			this.dayDiv = null;
			this.selectedYear = null;
			this.selectedMonth = null;
			this.selectedDay = null;
		}
	},
	getValue: function() {
		var m = picker._m,
			yy = m.$("#" + this.yearId).value,
			mm = m.$("#" + this.monthId).value,
			dd = m.$("#" + this.dayId).value;

		if (mm != "月" && (parseFloat(mm, 10) < 10)) {
			mm = "0" + mm;
		}
		if (dd != "日" && (parseFloat(dd, 10) < 10)) {
			dd = "0" + dd;
		}
		return (yy == "年" ? "0" : yy) + (mm == "月" ? "-" + "0" : "-" + mm) + (dd == "日" ? "-" + "0" : "-" + dd);
	},
	setValue: function(val) { //2013,0,0
		var m = picker._m,
			yy = m.$("#" + this.yearId),
			mm = m.$("#" + this.monthId),
			dd = m.$("#" + this.dayId),
			yyy = this.selectedYear == null ? "": this.selectedYear.getAttribute("name"),
			mmm = this.selectedMonth == null ? "": this.selectedMonth.getAttribute("name"),
			ddd = this.selectedDay == null ? "": this.selectedDay.getAttribute("name");

		if (this.validate) { 

		}

		if (arguments.length == 0) {
			yy.value = yyy == "" ? "年" : yyy;
			mm.value = mmm == "" ? "月" : mmm;
			dd.value = ddd == "" ? "日" : ddd;
		} else {
			yy.value = (arguments[0] != 0 ? arguments[0] : "年");
			mm.value = (arguments[1] != 0 ? arguments[1] : "月");
			dd.value = (arguments[2] != 0 ? arguments[2] : "日");
		}
	}
}