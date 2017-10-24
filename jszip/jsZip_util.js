!(function(e) { typeof exports == 'object' ? module.exports = e() : typeof define == 'function' && define.amd ? define(e) : 'undefined' != typeof window ? window.JSZipUtils = e() : 'undefined' != typeof global ? global.JSZipUtils = e() : 'undefined' != typeof self && (self.JSZipUtils = e()) })(function() { var define,
    module,
    exports; return (function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { var a = typeof require == 'function' && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); throw new Error("Cannot find module '" + o + "'") } var f = n[o] = { exports: {}}; t[o][0].call(f.exports, function(e) { var n = t[o][1][e]; return s(n ? n : e) }, f, f.exports, e, t, n, r) } return n[o].exports } var i = typeof require == 'function' && require; for (var o = 0; o < r.length; o++)s(r[o]); return s })({
    1: [function(require, module, exports) {
        var JSZipUtils = {};
        JSZipUtils._getBinaryFromXHR = function (xhr) {
            // for xhr.responseText, the 0xFF mask is applied by JSZip
            return xhr.response || xhr.responseText;
        };
        function createStandardXHR() {
            try {
                return new window.XMLHttpRequest();
            } catch (e) {}
        }

        function createActiveXHR() {
            try {
                return new window.ActiveXObject('Microsoft.XMLHTTP');
            } catch (e) {}
        }
        var createXHR = window.ActiveXObject ?
            function() {
                return createStandardXHR() || createActiveXHR();
            } :
            // For all other browsers, use the standard XMLHttpRequest object
            createStandardXHR;

        JSZipUtils.getBinaryContent = function(path, callback) {
            try {

                var xhr = createXHR();

                xhr.open('GET', path, true);

                // recent browsers
                if ('responseType' in xhr) {
                    xhr.responseType = 'arraybuffer';
                }

                // older browser
                if (xhr.overrideMimeType) {
                    xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }

                xhr.onreadystatechange = function(evt) {
                    var file,
                        err;
                    // use `xhr` and not `this`... thanks IE
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200 || xhr.status === 0) {
                            file = null;
                            err = null;
                            try {
                                file = JSZipUtils._getBinaryFromXHR(xhr);
                            } catch (e) {
                                err = new Error(e);
                            }
                            callback(err, file);
                        } else {
                            callback(new Error('Ajax error for ' + path + ' : ' + this.status + ' ' + this.statusText), null);
                        }
                    }
                };

                xhr.send();

            } catch (e) {
                callback(new Error(e), null);
            }
        };

        // export
        module.exports = JSZipUtils;

    }, {}]
}, {}, [1])
(1);
});
