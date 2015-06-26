
// This must be done when the js file is first loaded
var scriptFiles = document.getElementsByTagName("script");
var THIS_JS_FILE = "https://amara.org/embedder-iframe";

(function(window) {
    var AmaraIframeController = function() {
	var iframes = [];
	var loadingDivs = [];
	var timers = [];
	var iframeDomain = '';
	var absoluteURL = new RegExp('^(?:[a-z]+:)?//', 'i');
	var resize = function(index, width, height) {
            if (iframes[index].style.visibility == "visible")
                iframes[index].parentNode.style.height = "";
	    iframes[index].width = 0;
	    iframes[index].width = width;
	    iframes[index].height = height;
	};
	var updateContent = function(index, content) {
	    iframes[index].innerHTML = content;
	};
	var updateLoading = function(index, error) {
            if (error) {
                loadingDivs[index].innerHTML = "This video type is not supported by the Amara embedder. You can check if your hosting service offers HTML5 video resources.";
            } else {
	        loadingDivs[index].style.display = "none";
	        iframes[index].style.visibility = "visible";
	        iframes[index].style.opacity = 1;
	        iframes[index].parentNode.style.backgroundColor = "transparent";
            }
	};
	this.resizeReceiver = function(e) {
	    if (e.data.initDone)
		window.clearInterval(timers[e.data.index]);
	    if (e.data.resize)
		resize(e.data.index, e.data.width, e.data.height);
	    if (e.data.content)
		updateContent(e.data.index, e.data.content);
            if (e.data.error == window.MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED)
                updateLoading(e.data.index, true);
	    if (e.data.videoReady)
                updateLoading(e.data.index);
	    if (e.data.thumbnailReady)
                updateLoading(e.data.index);
	};

	this.initIframes = function(elements) {
	    var parser = document.createElement('a');
	    parser.href = THIS_JS_FILE;
	    iframeDomain = parser.protocol + '//' + parser.host;
	    for (var i = 0 ; i < elements.length ; i++) {
		var currentDiv = elements[i];
		var noanalytics = false;
                var loadingDiv = document.createElement("DIV");
                if (currentDiv.dataset.noanalytics && (currentDiv.dataset.noanalytics == "true"))
                    noanalytics = true;
                if (currentDiv.dataset.width)
                    currentDiv.style.width = currentDiv.dataset.width;
                if (currentDiv.dataset.height)
                    currentDiv.style.height = (36 + parseInt(currentDiv.dataset.height)) + "px";
                currentDiv.style.backgroundColor = "#1b1c1d";
                currentDiv.style.color = "white";
                if (currentDiv.dataset.height)
                    loadingDiv.style.paddingTop = ((36 + parseInt(currentDiv.dataset.height)) / 2 - 33) + "px";
                else
                    loadingDiv.style.paddingTop = "200px";
		loadingDiv.style.paddingLeft = loadingDiv.style.paddingRight = "50px";
                loadingDiv.style.textAlign = "center";
                loadingImg = document.createElement("IMG");
                if (absoluteURL.test("//s3.amazonaws.com/s3.www.universalsubtitles.org/881a8deb/"))
                    loadingImg.src = "//s3.amazonaws.com/s3.www.universalsubtitles.org/881a8deb/images/embedder/loading.gif";
                else
                    loadingImg.src = parser.protocol + "//" + parser.host + "//s3.amazonaws.com/s3.www.universalsubtitles.org/881a8deb/images/embedder/loading.gif";
                loadingDiv.appendChild(loadingImg);
                currentDiv.appendChild(loadingDiv); 

		var iframe = document.createElement("IFRAME");
		iframe.src = parser.protocol + "//" + parser.host + "/embedder-widget-iframe/";
		if (noanalytics) iframe.src += "noanalytics/";
		iframe.src += "?data=" +
		    encodeURIComponent(JSON.stringify(currentDiv.dataset));
		iframe.style.border = "none";
		iframe.style.overflow = "hidden";
		iframe.scrolling = "no";
		iframe.style.opacity = 0;
		currentDiv.appendChild(iframe);
		loadingDivs.push(loadingDiv);
		iframes.push(iframe);
	    }
	};
	this.initResize = function() {
            var controller = this;
            iframes.forEach(function(iframe, index) {
                iframe.baseURI = iframeDomain;
		        timers.push(window.setInterval(function() {
                    controller.postToIframe(iframe, index);
		}
                                               ,1000));
            });
        };
	this.postToIframe = function(iframe, index) {
	    if (iframe.contentWindow) {
		iframe.contentWindow.postMessage({fromIframeController: true, index: index}, iframeDomain);
	    }
	};
    };
    window.AmaraIframeController = AmaraIframeController;

    var initIframeController = function() {
	var controller = new window.AmaraIframeController();
	window.addEventListener('message', controller.resizeReceiver, false);
	controller.initIframes(document.getElementsByClassName("amara-embed"));
	controller.initResize();
	document.addEventListener("DOMNodeInserted", function(event) {
	    var elements = document.getElementsByClassName("amara-embed");
	    var emptyElements = [];
	    for (var i = 0 ; i < elements.length ; i++) {
		if (elements[i].childNodes.length == 0 || ((elements[i].childNodes.length == 1) && (elements[i].childNodes[0].nodeType == 3)))
		    emptyElements.push(elements[i]);
	    }
	    if (emptyElements.length > 0)
		controller.initIframes(emptyElements);
	    controller.initResize();

	});

    };
    window.initIframeController = initIframeController;

})(window);

if(window.attachEvent) {
    window.attachEvent('onload', window.initIframeController);
} else {
    if(window.onload) {
        var curronload = window.onload;
        var newonload = function() {
            curronload();
            window.initIframeController();
        };
        window.onload = newonload;
    } else {
        window.onload = window.initIframeController;
    }
}
