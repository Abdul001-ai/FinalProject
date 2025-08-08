"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@heroui+use-callback-ref@2.1.7_react@19.1.0";
exports.ids = ["vendor-chunks/@heroui+use-callback-ref@2.1.7_react@19.1.0"];
exports.modules = {

/***/ "(ssr)/./node_modules/.pnpm/@heroui+use-callback-ref@2.1.7_react@19.1.0/node_modules/@heroui/use-callback-ref/dist/index.mjs":
/*!*****************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@heroui+use-callback-ref@2.1.7_react@19.1.0/node_modules/@heroui/use-callback-ref/dist/index.mjs ***!
  \*****************************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   useCallbackRef: () => (/* binding */ useCallbackRef)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/.pnpm/next@15.3.5_@babel+core@7.2_59a685cecc86146db29560d6fd5f016c/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js\");\n/* harmony import */ var _heroui_use_safe_layout_effect__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @heroui/use-safe-layout-effect */ \"(ssr)/./node_modules/.pnpm/@heroui+use-safe-layout-effect@2.1.7_react@19.1.0/node_modules/@heroui/use-safe-layout-effect/dist/index.mjs\");\n// src/index.ts\n\n\nfunction useCallbackRef(fn, deps = []) {\n  const ref = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(fn);\n  (0,_heroui_use_safe_layout_effect__WEBPACK_IMPORTED_MODULE_1__.useSafeLayoutEffect)(() => {\n    ref.current = fn;\n  });\n  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((...args) => {\n    var _a;\n    return (_a = ref.current) == null ? void 0 : _a.call(ref, ...args);\n  }, deps);\n}\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vQGhlcm91aSt1c2UtY2FsbGJhY2stcmVmQDIuMS43X3JlYWN0QDE5LjEuMC9ub2RlX21vZHVsZXMvQGhlcm91aS91c2UtY2FsbGJhY2stcmVmL2Rpc3QvaW5kZXgubWpzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQzRDO0FBQ3lCO0FBQ3JFO0FBQ0EsY0FBYyw2Q0FBTTtBQUNwQixFQUFFLG1GQUFtQjtBQUNyQjtBQUNBLEdBQUc7QUFDSCxTQUFTLGtEQUFXO0FBQ3BCO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFHRSIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxBZG1pblxcRGVza3RvcFxcbmV3XFxjbG91ZGZsYXJlLXdvcmtlcnMtbmV4dGpzLXNhYXMtdGVtcGxhdGVcXG5vZGVfbW9kdWxlc1xcLnBucG1cXEBoZXJvdWkrdXNlLWNhbGxiYWNrLXJlZkAyLjEuN19yZWFjdEAxOS4xLjBcXG5vZGVfbW9kdWxlc1xcQGhlcm91aVxcdXNlLWNhbGxiYWNrLXJlZlxcZGlzdFxcaW5kZXgubWpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIHNyYy9pbmRleC50c1xuaW1wb3J0IHsgdXNlQ2FsbGJhY2ssIHVzZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlU2FmZUxheW91dEVmZmVjdCB9IGZyb20gXCJAaGVyb3VpL3VzZS1zYWZlLWxheW91dC1lZmZlY3RcIjtcbmZ1bmN0aW9uIHVzZUNhbGxiYWNrUmVmKGZuLCBkZXBzID0gW10pIHtcbiAgY29uc3QgcmVmID0gdXNlUmVmKGZuKTtcbiAgdXNlU2FmZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgcmVmLmN1cnJlbnQgPSBmbjtcbiAgfSk7XG4gIHJldHVybiB1c2VDYWxsYmFjaygoLi4uYXJncykgPT4ge1xuICAgIHZhciBfYTtcbiAgICByZXR1cm4gKF9hID0gcmVmLmN1cnJlbnQpID09IG51bGwgPyB2b2lkIDAgOiBfYS5jYWxsKHJlZiwgLi4uYXJncyk7XG4gIH0sIGRlcHMpO1xufVxuZXhwb3J0IHtcbiAgdXNlQ2FsbGJhY2tSZWZcbn07XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/@heroui+use-callback-ref@2.1.7_react@19.1.0/node_modules/@heroui/use-callback-ref/dist/index.mjs\n");

/***/ })

};
;