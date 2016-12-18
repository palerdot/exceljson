var App = {

    init: function() {
        console.log("app inited");

        this.initEvents();

        var options = this.getFileReaderOptions();
        $("#file-input").fileReaderJS(options);

    },

    initEvents: function() {
        // when upload button is clicked, trigger the hidden file input
        $("#upload-file").click(function() {
            $("#file-input").click();
        });
    },

    displayFileContent: function(content) {
        
        var parsed = d3.csvParseRows(content, function (d) {
            return d;
        });
        console.log("file content ", parsed);
    },

    getFileReaderOptions: function() {

        var self = this; // save reference

        // ref: https://bgrins.github.io/filereader.js/
        var options = {
            // CSS Class to add to the drop element when a drag is active
            dragClass: "drag",

            // A string to match MIME types, for instance
            accept: false,

            // An object specifying how to read certain MIME types
            // For example: {
            //  'image/*': 'DataURL',
            //  'data/*': 'ArrayBuffer',
            //  'text/*' : 'Text'
            // }
            readAsMap: {},

            // How to read any files not specified by readAsMap
            // readAsDefault: 'DataURL',
            readAsDefault: 'Text',

            on: {
                beforestart: function(e, file) {
                    // return false if you want to skip this file
                },
                loadstart: function(e, file) { /* Native ProgressEvent */ },
                progress: function(e, file) {
                    console.log("progress ? ", e);
                },
                load: function(e, file) {
                    console.log("file loaded? ", arguments);
                },
                error: function(e, file) { /* Native ProgressEvent */ },
                loadend: function(e, file) {
                    console.log("load end? ", arguments);
                    self.displayFileContent(e.target.result);
                },
                abort: function(e, file) { /* Native ProgressEvent */ },
                skip: function(e, file) {
                    // Called when a file is skipped.  This happens when:
                    //  1) A file doesn't match the accept option
                    //  2) false is returned in the beforestart callback
                },
                groupstart: function(group) {
                    //
                    // Called when a 'group' (a single drop / copy / select that may
                    // contain multiple files) is receieved.
                    // You can ignore this event if you don't care about groups
                },
                groupend: function(group) {
                    // Called when a 'group' is finished.
                    // You can ignore this event if you don't care about groups
                }
            }
        };

        return options;

    },

};

$(document).ready(function() {
    console.log("doc ready");
    App.init();
});
