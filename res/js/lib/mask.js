(function () {
	$.extend($.fn, {mask:function (msg, maskDivClass) {
		this.unmask();
		var op = {opacity:0.3, z:10000, bgcolor:"#F8F8F8"};
		var original = $(document.body);
		var position = {top:0, left:0};
		if (this[0] && this[0] !== window.document) {
			original = this;
			position = original.position();
		}
		// 创建一个 Mask 层，追加到对象中
		var maskDiv = $("<div class=\"maskdivgen\"> </div>");
		maskDiv.appendTo(original);
		var maskWidth = original.outerWidth();
		if (!maskWidth) {
			maskWidth = original.width();
		}
		var maskHeight = original.outerHeight();
		if (!maskHeight) {
			maskHeight = original.height();
		}
		maskDiv.css({position:"absolute", top:position.top, left:position.left, "z-index":op.z, width:maskWidth, height:maskHeight, "background-color":op.bgcolor, opacity:0});
		if (maskDivClass) {
			maskDiv.addClass(maskDivClass);
		}
		if (!msg) {
			msg = "<img src=\"/skin/form/style/form/images-common/waiting/loading.gif\" width=\"32px\" height=\"32px\" border=\"0\">";
		}
		var msgDiv = $("<div id=\"maskMsg\" style=\"position:absolute;border:none;background:#fff;\">" + msg + "</div>");
		msgDiv.appendTo(maskDiv);
		var widthspace = (maskDiv.width() - msgDiv.width());
		var heightspace = (maskDiv.height() - msgDiv.height());
		msgDiv.css({top:(heightspace / 2 - 2), left:(widthspace / 2 - 2)});
		maskDiv.fadeIn("fast", function () {
			// 淡入淡出效果
			$(this).fadeTo("fast", op.opacity);
		});
		return maskDiv;
	}, unmask:function () {
		var original = $(document.body);
		if (this[0] && this[0] !== window.document) {
			original = $(this[0]);
		}
		original.find("> div.maskdivgen").fadeOut("slow", 0, function () {
			$(this).remove();
		});
	}});
})();

