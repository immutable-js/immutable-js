goog.provide('cljs.nodejs');
goog.require('cljs.core');
cljs.nodejs.require = require;
cljs.nodejs.process = process;
cljs.nodejs.enable_util_print_BANG_ = (function enable_util_print_BANG_(){return cljs.core.string_print = cljs.nodejs.require.call(null,"util").print;
});
