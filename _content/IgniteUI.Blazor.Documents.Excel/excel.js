var igExcelFormatFlags;
(function (igExcelFormatFlags) {
    igExcelFormatFlags[igExcelFormatFlags["None"] = 0] = "None";
    igExcelFormatFlags[igExcelFormatFlags["Wrap"] = 1] = "Wrap";
    igExcelFormatFlags[igExcelFormatFlags["Underline"] = 2] = "Underline";
    igExcelFormatFlags[igExcelFormatFlags["Bold"] = 4] = "Bold";
    igExcelFormatFlags[igExcelFormatFlags["Italic"] = 8] = "Italic";
})(igExcelFormatFlags || (igExcelFormatFlags = {}));
var igExcelMeasureHelper = /** @class */ (function () {
    function igExcelMeasureHelper() {
        this.textElements = [];
    }
    igExcelMeasureHelper.prototype.createSizeContainer = function () {
        var element = document.createElement("div");
        element.style.position = "absolute";
        element.style.display = "block";
        element.style.visibility = "hidden";
        element.style.overflow = "hidden";
        document.body.appendChild(element);
        return element;
    };
    igExcelMeasureHelper.prototype.createMeasureElement = function (wrap, underline, bold, italic) {
        var element = document.createElement("span");
        element.style.border = "0px none";
        element.style.margin = "0px";
        element.style.padding = "0px";
        element.style.lineHeight = "normal";
        element.style.position = "relative";
        element.style.display = "block";
        element.style.visibility = "hidden";
        element.style.whiteSpace = (wrap ? "pre-wrap" : "pre");
        element.style.overflowWrap = (wrap ? "break-word" : "normal");
        element.style.wordWrap = (wrap ? "break-word" : "normal");
        element.style.textDecoration = (underline ? "underline" : "none");
        element.style.fontWeight = (bold ? "bold" : "normal");
        element.style.fontStyle = (italic ? "italic" : "normal");
        return element;
    };
    igExcelMeasureHelper.prototype.getExtent = function (extent) {
        return parseFloat(extent.replace("px", ""));
    };
    igExcelMeasureHelper.prototype.createTextMeasureElement = function (fontFamily, fontSize, flags) {
        var wrap = (flags & igExcelFormatFlags.Wrap) == igExcelFormatFlags.Wrap;
        var underline = (flags & igExcelFormatFlags.Underline) == igExcelFormatFlags.Underline;
        var bold = (flags & igExcelFormatFlags.Bold) == igExcelFormatFlags.Bold;
        var italic = (flags & igExcelFormatFlags.Italic) == igExcelFormatFlags.Italic;
        // using invoke
        //fontFamily = BINDING.conv_string(fontFamily);
        //fontSize = BINDING.conv_string(fontSize);
        var elem = this.createMeasureElement(wrap, underline, bold, italic);
        if (!this.resizeContainer) {
            this.resizeContainer = this.createSizeContainer();
        }
        elem.style.fontFamily = fontFamily;
        elem.style.fontSize = fontSize;
        this.resizeContainer.appendChild(elem);
        this.textElements.push(elem);
        return this.textElements.length - 1;
    };
    igExcelMeasureHelper.prototype.getRowHeight = function (fontFamily, fontSize) {
        var elem = this.rowHeightElement;
        if (!elem) {
            if (!this.resizeContainer) {
                this.resizeContainer = this.createSizeContainer();
            }
            elem = this.rowHeightElement = this.createMeasureElement(false, false, false, false);
            elem.innerText = "0";
            this.resizeContainer.appendChild(elem);
        }
        elem.style.fontFamily = fontFamily;
        elem.style.fontSize = fontSize;
        var result = this.getExtent(window.getComputedStyle(elem).height);
        return result;
    };
    igExcelMeasureHelper.prototype.measureText = function (textElementId, text, maxWidth) {
        var span = this.textElements[textElementId];
        span.innerText = text;
        span.style.maxWidth = maxWidth > 0 ? maxWidth + "px" : "none";
        var cs = window.getComputedStyle(span);
        var width = this.getExtent(cs.width);
        var height = this.getExtent(cs.height);
        return [width, height];
    };
    igExcelMeasureHelper.prototype.measureSingleLineText = function (text, font) {
        if (!this.canvasContext) {
            this.canvas = document.createElement("canvas");
            this.canvasContext = this.canvas.getContext("2d");
        }
        this.canvasContext.font = font;
        var width = this.canvasContext.measureText(text).width;
        return width;
    };
    igExcelMeasureHelper.prototype.destroy = function () {
        if (this.resizeContainer)
            this.resizeContainer.parentNode.removeChild(this.resizeContainer);
    };
    return igExcelMeasureHelper;
}());
window.igExcelCreateMeasureHelper = function () {
    return new igExcelMeasureHelper();
};
window.igExcelMeasureHelpers = [];
window.igExcelCreateMeasureHelperId = function () {
    var root = window;
    if (!root.igExcelMeasureHelpers)
        root.igExcelMeasureHelpers;
    var helper = new igExcelMeasureHelper();
    root.igExcelMeasureHelpers.push(helper);
    return root.igExcelMeasureHelpers.length - 1;
};
window.igExcelCreateTextMeasureElement = function (helperId, fontFamily, fontSize, flags) {
    var helper = window.igExcelMeasureHelpers[helperId];
    return helper.createTextMeasureElement(fontFamily, fontSize, flags);
};
window.igExcelGetRowHeight = function (helperId, fontFamily, fontSize) {
    var helper = window.igExcelMeasureHelpers[helperId];
    return helper.getRowHeight(fontFamily, fontSize);
};
window.igExcelMeasureText = function (helperId, textElementId, text, maxWidth) {
    var helper = window.igExcelMeasureHelpers[helperId];
    return helper.measureText(textElementId, text, maxWidth);
};
window.igExcelMeasureSingleLineText = function (helperId, text, font) {
    var helper = window.igExcelMeasureHelpers[helperId];
    return helper.measureSingleLineText(text, font);
};
window.igExcelDestroyMeasureHelper = function (helperId) {
    var helper = window.igExcelMeasureHelpers[helperId];
    helper.destroy();
};