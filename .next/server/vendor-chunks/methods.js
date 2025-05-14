"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/methods";
exports.ids = ["vendor-chunks/methods"];
exports.modules = {

/***/ "(rsc)/./paapi5/node_modules/methods/index.js":
/*!**********************************************!*\
  !*** ./paapi5/node_modules/methods/index.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("/*!\n * methods\n * Copyright(c) 2013-2014 TJ Holowaychuk\n * Copyright(c) 2015-2016 Douglas Christopher Wilson\n * MIT Licensed\n */\n\n\n\n/**\n * Module dependencies.\n * @private\n */\n\nvar http = __webpack_require__(/*! http */ \"http\");\n\n/**\n * Module exports.\n * @public\n */\n\nmodule.exports = getCurrentNodeMethods() || getBasicNodeMethods();\n\n/**\n * Get the current Node.js methods.\n * @private\n */\n\nfunction getCurrentNodeMethods() {\n  return http.METHODS && http.METHODS.map(function lowerCaseMethod(method) {\n    return method.toLowerCase();\n  });\n}\n\n/**\n * Get the \"basic\" Node.js methods, a snapshot from Node.js 0.10.\n * @private\n */\n\nfunction getBasicNodeMethods() {\n  return [\n    'get',\n    'post',\n    'put',\n    'head',\n    'delete',\n    'options',\n    'trace',\n    'copy',\n    'lock',\n    'mkcol',\n    'move',\n    'purge',\n    'propfind',\n    'proppatch',\n    'unlock',\n    'report',\n    'mkactivity',\n    'checkout',\n    'merge',\n    'm-search',\n    'notify',\n    'subscribe',\n    'unsubscribe',\n    'patch',\n    'search',\n    'connect'\n  ];\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9wYWFwaTUvbm9kZV9tb2R1bGVzL21ldGhvZHMvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVhOztBQUViO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFdBQVcsbUJBQU8sQ0FBQyxrQkFBTTs7QUFFekI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxGdWppdHN1XFxEZXNrdG9wXFxjdXBvbnNcXHBhYXBpNVxcbm9kZV9tb2R1bGVzXFxtZXRob2RzXFxpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqIG1ldGhvZHNcbiAqIENvcHlyaWdodChjKSAyMDEzLTIwMTQgVEogSG9sb3dheWNodWtcbiAqIENvcHlyaWdodChjKSAyMDE1LTIwMTYgRG91Z2xhcyBDaHJpc3RvcGhlciBXaWxzb25cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICogQHByaXZhdGVcbiAqL1xuXG52YXIgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcblxuLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqIEBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEN1cnJlbnROb2RlTWV0aG9kcygpIHx8IGdldEJhc2ljTm9kZU1ldGhvZHMoKTtcblxuLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnQgTm9kZS5qcyBtZXRob2RzLlxuICogQHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBnZXRDdXJyZW50Tm9kZU1ldGhvZHMoKSB7XG4gIHJldHVybiBodHRwLk1FVEhPRFMgJiYgaHR0cC5NRVRIT0RTLm1hcChmdW5jdGlvbiBsb3dlckNhc2VNZXRob2QobWV0aG9kKSB7XG4gICAgcmV0dXJuIG1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIFwiYmFzaWNcIiBOb2RlLmpzIG1ldGhvZHMsIGEgc25hcHNob3QgZnJvbSBOb2RlLmpzIDAuMTAuXG4gKiBAcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGdldEJhc2ljTm9kZU1ldGhvZHMoKSB7XG4gIHJldHVybiBbXG4gICAgJ2dldCcsXG4gICAgJ3Bvc3QnLFxuICAgICdwdXQnLFxuICAgICdoZWFkJyxcbiAgICAnZGVsZXRlJyxcbiAgICAnb3B0aW9ucycsXG4gICAgJ3RyYWNlJyxcbiAgICAnY29weScsXG4gICAgJ2xvY2snLFxuICAgICdta2NvbCcsXG4gICAgJ21vdmUnLFxuICAgICdwdXJnZScsXG4gICAgJ3Byb3BmaW5kJyxcbiAgICAncHJvcHBhdGNoJyxcbiAgICAndW5sb2NrJyxcbiAgICAncmVwb3J0JyxcbiAgICAnbWthY3Rpdml0eScsXG4gICAgJ2NoZWNrb3V0JyxcbiAgICAnbWVyZ2UnLFxuICAgICdtLXNlYXJjaCcsXG4gICAgJ25vdGlmeScsXG4gICAgJ3N1YnNjcmliZScsXG4gICAgJ3Vuc3Vic2NyaWJlJyxcbiAgICAncGF0Y2gnLFxuICAgICdzZWFyY2gnLFxuICAgICdjb25uZWN0J1xuICBdO1xufVxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./paapi5/node_modules/methods/index.js\n");

/***/ })

};
;