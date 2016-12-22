var App = {

    init: function() {
        console.log("app inited");

        // init events
        this.initEvents();
        // init vue components
        this.initVueComponents();
        // init vue
        this.initVues();

        var options = this.getFileReaderOptions();
        $("#file-input").fileReaderJS(options);

    },

    initEvents: function() {
        // when upload button is clicked, trigger the hidden file input
        // $("#upload-file").click(function() {
        //     $("#file-input").click();
        // });
    },

    initVueComponents: function () {
        console.log("porumai! initing vue components");
        Vue.component("progress-bar", {
            props: ["progress"],
            template: "<div class='progress'> {{ progress }} <div class='determinate' style='width: {{ progress }}%'></div></div>"
        });
    },

    initVues: function () {
        console.log("porumai! initing vues");

        // upload pane vue component
        this.initUploadPane();
        // json pane vue component
        this.initJSONPane();
    },

    initUploadPane: function () {

        this.uploadPane = new Vue({

            el: "#upload-pane",

            data: {
                file: {},
                progress: false,
                fileValid: false,
                isColumnHeader: true
            },

            computed: {
                invalidFile: function () {
                    // file should not be empty; && should have valid extension
                    return !_.isEmpty( this.file ) && !this.fileValid;
                },
                progressPercent: function () {
                    return (this.progress) ? (this.progress + "%") : "0%";
                }
            },

            methods: {

                isFileEmpty: function () {
                    return _.isEmpty( this.file );
                },

                getFileType: function () {

                    if (this.isFileEmpty()) {
                        // if no file, return file type as false
                        return false;
                    }

                    return this.file.extra.extension;
                },

                initUploadFile: function () {
                    console.log("initing upload file ", this.$refs["input-file-form"]);
                    // clear the input form
                    var input_file_form = this.$refs["input-file-form"];
                    input_file_form.reset && input_file_form.reset();
                    // reset the file
                    this.file = {};
                    $("#file-input").click();
                },

                handleColumnHeaderChange: function () {
                    console.log("handleColumnHeaderChange ", this.isColumnHeader, typeof(this.isColumnHeader));
                }
            }

        });

    },

    initJSONPane: function () {

        this.jsonPane = new Vue({

            el: "#json-pane",

            data: {
                json_string: false,
                json: {}
            },

            computed: {
                defaultJSON: function () {
                    return {
                        "message": "Hello!"
                    };
                }
            },

            methods: {

                isValidJSON: function () {

                    if (!this.json) {
                        return undefined;
                    }

                    var is_valid_json = false;

                    try {
                        this.json = JSON.parse( this.json_string );
                        is_valid_json = true;
                    } catch (e) {
                        console.log("json error ", e);
                        is_valid_json = false;
                    }

                    return is_valid_json;
                }
            }

        });

    },

    // validating file content
    // parse only if extension is valid => csv, tsv
    validateFileContent: function (file, content) {

        // only csv, tsv files are allowed
        var valid_file_types = ["text/csv", "text/tsv"];

        var file_type = file && file.type,
            file_valid = _.includes( valid_file_types, file_type );

        // update the file details for upload pane
        this.uploadPane.file = file;

        if (file_valid) {
            console.log("Porumai! valid file");
            // update the file valid status
            this.uploadPane.fileValid = true;
            // proceed to process the file content
            this.processFileContent( content );
        } else {
            console.log("Porumai! FILE NOT VALID. Only CSV and TSV files are allowed");
            // update the file valid status
            this.uploadPane.fileValid = false;
        }

    },

    processFileContent: function (content) {

        console.log("processing file content");

        var file_type = this.uploadPane.getFileType();

        switch (file_type) {
            case "csv":
                this.processCSVFile( content );
                break;

            case "tsv":
                this.processTSVFile( content );
                break;

            default:
                console.log("handling some other file ", file_type);
                break;
        }

        return;
    },

    processCSVFile: function (content) {

        var is_column_header = this.uploadPane.isColumnHeader,
            parsed = false;

        if (is_column_header) {
            parsed = d3.csvParse(content, function (d) {
                return d;
            });
        } else {
            parsed = d3.csvParseRows(content, function (d) {
                return d;
            });
        }

        console.log("file content ", parsed, this.uploadPane.getFileType() );
    },

    processTSVFile: function (content) {

        var parsed = d3.csvParseRows(content, function (d) {
            return d;
        });

        console.log("file content ", parsed, this.uploadPane.getFileType() );

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
                loadstart: function(e, file) {

                },
                progress: function(e, file) {
                    var progress = Math.ceil( (e.loaded/e.total) * 100 );
                    self.uploadPane.progress = progress;
                    // for now we have to update the width manually through vue refs
                    // $( self.uploadPane.$refs.determinate ).css("width", progress+ "%");
                },
                load: function(e, file) {
                    console.log("file loaded? ", arguments);
                },
                error: function(e, file) { /* Native ProgressEvent */ },
                loadend: function(e, file) {
                    // mark progress as false to hide the loader
                    self.uploadPane.progress = false;
                    console.log("load end? ", arguments, e, file);
                    // file is loaded; let us validate the file content for extension
                    self.validateFileContent(file, e.target.result);
                    // self.displayFileContent(e.target.result);
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
    App.init();
    // init the "materialize tabs" manually as vue messes up with initial stuff
    $('.tabs').tabs();
});
