// ref: https://github.com/webpack/imports-loader
// require("imports-loader?$=jquery,window!./js/filereader.js");
// require("imports?$=jquery!./js/materialize.min.js");
// import "./js/filereader.js";

// generic libraries
// import "materialize-css";

// import $ from "jquery";
import App from "./js/app";

// window.App = App;

console.log("this is ", this, window);

$(document).ready(function() {
    console.log("doc ready");
    App.init();
    // $("#file-input").fileReaderJS(options);
    // init the "materialize tabs" manually as vue messes up with initial stuff
    // console.log("initing tabs");
    $('.tabs').tabs();
    // for now let us manually change to preview window using materialize plugin
    $('ul.tabs').tabs('select_tab', 'preview-window');
});
