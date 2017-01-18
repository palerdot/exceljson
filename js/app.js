// import $ from "jquery";
import _ from "lodash";
import JSONFormatter from 'json-formatter-js';
import clipboard from "clipboard-js";
import FileSaver from "file-saver";
// import d3 from "d3";
// note: d3 csv parsers are in different package => "d3-dsv"
import { csvParse, csvParseRows, tsvParse, tsvParseRows, csvFormat, csvFormatRows, tsvFormat, tsvFormatRows } from "d3-dsv";
import Vue from "vue";

var App = {

    init: function() {
        console.log("app inited ");

        // init events
        this.initEvents();
        // init vue components
        this.initVueComponents();
        // init vue
        this.initVues();

        var options = this.getFileReaderOptions();
        console.log("initing ", $("#file-input"));
        // ref: https://bgrins.github.io/filereader.js/
        // initialize the file input 
        FileReaderJS.setupInput(document.getElementById('file-input'), options);
        // Accept dropped files on the specified file
        FileReaderJS.setupDrop(document.getElementById('drag-zone'), options);
        // Accept paste events if available
        FileReaderJS.setupClipboard(document.body, options);
        // $('.tabs').tabs();
        // $("#file-input").fileReaderJS(options);
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

        var self = this; // save reference

        this.jsonPane = new Vue({

            el: "#json-pane",

            data: {
                json_string: "{}",
                json: {},
                downloadFileName: "download - excelJSON",
                mode: "preview",
                isColumnHeader: true
            },

            computed: {

                isEditMode: function () {
                    console.log("edit mode ? ", this.mode, (this.mode == "edit"));
                    return {
                        active: false
                    };
                },

                isPreviewMode: function () {
                    console.log("preview mode ? ", this.mode, (this.mode == "preview"));
                    return {
                        active: true
                    };
                },

                isPreviewModeActive: function () {
                    console.log("preview mode ? ", this.mode, (this.mode == "preview"));
                    // note we have to disable the preview mode if not valid json
                    return {
                        tab: true,
                        disabled: !this.validJSON,
                        active: (this.mode == "preview")
                    }
                },

                validJSON: function () {

                    var is_valid_json = false;

                    try {
                        this.json = JSON.parse( this.json_string );
                        console.log("VALID json ", new Date(), this.json);
                        is_valid_json = true;
                    } catch (e) {
                        console.log("json error ", e);
                        is_valid_json = false;
                    }

                    return is_valid_json;
                },

                // gives the json string for the textarea
                JSONString: function () {
                    console.log("getting JSONString ", new Date());
                    // if valid json, let us return properly formatted json
                    if (this.validJSON) {
                        var json = _.isEmpty( this.json ) ? this.defaultJSON : this.json;

                        return JSON.stringify( json, null, 4 );    
                    } else {
                        // let us return the json string as it is 
                        return this.json_string;
                    }
                },

                defaultJSON: function () {
                    return {
                        "message": "Hello!"
                    };
                }
            },

            methods: {

                getJSON: function () {
                    return _.isEmpty( this.json ) ? this.defaultJSON : this.json;
                },

                // NOTE:
                // QUIRK: for the preview json rendering to work correctly, we are injecting the actual html using jquery
                // as vue does not allow displaying of html nodes.
                getPreviewJSON: function () {
                    const formatter = new JSONFormatter( this.getJSON(), 2, {
                        hoverPreviewEnabled: false,
                        hoverPreviewArrayCount: 100,
                        hoverPreviewFieldCount: 5,
                        theme: '',
                        animateOpen: true,
                        animateClose: true
                    } );

                    var html = $( formatter.render() ).clone(true).html();
                    // var html = $( formatter.render() ).html();
                    // var html = formatter.render();
                    // NOTE: vue does not allow html with event bindings; appending the html blindly
                    $("#preview-window .json-window").html( formatter.render() );
                    // console.log("rendering html ", html, formatter, formatter.render(), $("#preview-window .json-window").html());
                    return html;
                },

                handleJSONChange: _.debounce( (e) => {
                    console.log("before ", this.json);
                    this.jsonPane.json_string = $(e.target).val();
                    // if valid json
                    console.log("handling json change ", this.json, this.jsonPane.validJSON, this.jsonPane.JSONString);
                }, 550, {
                    leading: false,
                    trailing: true
                }),

                // copy the json to clipboard
                copyJSON: function () {
                    var text = JSON.stringify( this.getJSON() );
                    console.log("copying to clipboard ", text);
                    // window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
                    clipboard.copy( text )
                            .then(
                                function () { 
                                    console.log("success");
                                    Materialize.toast('JSON copied!', 3000) // 4000 is the duration of the toast 
                                },
                                function (err) {console.log("failure", err); }
                            );
                },

                // handle column header change
                handleColumnHeaderChange: function () {
                    console.log("column option ", this.isColumnHeader);
                },

                // download json as csv
                downloadCSV: function () {

                    var is_array = _.isArray( this.getJSON() );
                    
                    if (!is_array) {
                        Materialize.toast("JSON not an array!. Cannot convert JSON to CSV", 5000);
                        // do not proceed
                        return;
                    }
                    // now we need to find which module to use for the conversion
                    var parsed = "",
                        parse_error = false,
                        parse_error_msg = "";

                    if (this.isColumnHeader) {
                        try {
                            parsed = csvFormat( this.getJSON() );
                            parse_error = false;    
                        } catch (e) {
                            parse_error = true;
                            parse_error_msg = "CSV conversion Failed. Please check if JSON is array of objects.";
                        }
                    } else {
                        try {
                            parsed = csvFormatRows( this.getJSON() );    
                            parse_error = false;    
                        } catch (e) {
                            parse_error = true;
                            parse_error_msg = "CSV conversion Failed. Please check if JSON is array of arrays.";
                        }
                    }

                    if (parse_error) {
                        // show the error message
                        Materialize.toast( parse_error_msg, 4000 );
                        // do not proceed
                        return;
                    }

                    console.log("All success! proceed to download");
                    this.downloadFile( parsed, "csv" );
                },

                // download json as tsv
                downloadTSV: function () {

                    var is_array = _.isArray( this.getJSON() );
                    
                    if (!is_array) {
                        Materialize.toast("JSON not an array!. Cannot convert JSON to TSV", 5000);
                        // do not proceed
                        return;
                    }
                    // now we need to find which module to use for the conversion
                    var parsed = "",
                        parse_error = false,
                        parse_error_msg = "";

                    if (this.isColumnHeader) {
                        try {
                            parsed = tsvFormat( this.getJSON() );
                            parse_error = false;    
                        } catch (e) {
                            parse_error = true;
                            parse_error_msg = "TSV conversion Failed. Please check if JSON is array of objects.";
                        }
                    } else {
                        try {
                            parsed = tsvFormatRows( this.getJSON() );    
                            parse_error = false;    
                        } catch (e) {
                            parse_error = true;
                            parse_error_msg = "TSV conversion Failed. Please check if JSON is array of arrays.";
                        }
                    }

                    if (parse_error) {
                        // show the error message
                        Materialize.toast( parse_error_msg, 4000 );
                        // do not proceed
                        return;
                    }

                    console.log("All success! proceed to download");
                    this.downloadFile( parsed, "tsv" );
                },

                downloadFile: function (content, file_type) {

                    var isFileSaverSupported = false;

                    try {
                        isFileSaverSupported = !!new Blob;
                    } catch (e) {
                        isFileSaverSupported = false;
                    }

                    if (!isFileSaverSupported) {
                        Materialize.toast("File download not supported in your Browser. Please update to a latest browser.", 5000);
                        // do not proceed
                        return;
                    }

                    var mime_type = "text/" + file_type + ";charset=utf-8",
                        filename = (this.downloadFileName || "Porumai" ) + "." + file_type; 
                    // ref: https://github.com/eligrey/FileSaver.js
                    var file = new File([content], filename, {type: mime_type});

                    FileSaver.saveAs(file, filename);
                },
            }

        });

    },

    // validating file content
    // parse only if extension is valid => csv, tsv
    validateFileContent: function (file, content) {

        // only csv, tsv files are allowed
        var valid_file_types = ["text/csv", "text/tab-separated-values"];

        var file_type = file && file.type,
            file_valid = _.includes( valid_file_types, file_type );

        // update the file details for upload pane
        this.uploadPane.file = file;

        if (file_valid) {
            console.log("valid file");
            // update the file valid status
            this.uploadPane.fileValid = true;
            // proceed to process the file content
            this.processFileContent( content );
        } else {
            console.log("FILE NOT VALID. Only CSV and TSV files are allowed");
            // update the file valid status
            this.uploadPane.fileValid = false;
        }

    },

    processFileContent: function (content) {

        console.log("processing file content");

        var self = this; // save reference

        var file_type = this.uploadPane.getFileType(),
            json = {};

        console.log("PARSE start");

        switch (file_type) {
            case "csv":
                json = this.processCSVFile( content );
                break;

            case "tsv":
                json = this.processTSVFile( content );
                break;

            default:
                console.log("handling some other file ", file_type);
                break;
        }
        console.log("PARSE END");

        // all processed fine
        var json_string = JSON.stringify( json );
        // updating the json string and json for the json pane
        this.jsonPane.json = json;
        this.jsonPane.json_string = json_string;

        // scrolling to json pane
        this.scrollToJSONPane();

        Materialize.toast("JSON created!", 3000);

        return;
    },

    processCSVFile: function (content) {

        var is_column_header = this.uploadPane.isColumnHeader,
            parsed = false;

        if (is_column_header) {
            parsed = csvParse(content, function (d) {
                return d;
            });
        } else {
            parsed = csvParseRows(content, function (d) {
                return d;
            });
        }

        console.log("file content ", parsed, this.uploadPane.getFileType() );
        return parsed;
    },

    processTSVFile: function (content) {

        var is_column_header = this.uploadPane.isColumnHeader,
            parsed = false;

        if (is_column_header) {
            parsed = tsvParse(content, function (d) {
                return d;
            });
        } else {
            parsed = tsvParseRows(content, function (d) {
                return d;
            });
        }

        console.log("file content ", parsed, this.uploadPane.getFileType() );
        return parsed;
    },

    scrollToJSONPane: function () {

        var scrollTo =$("#json-pane").offset().top;

        $("body").animate({
            scrollTop: scrollTo
        }, 0, function () {
            console.log("scrolling end ", new Date());
        });

        // PREVIEW BUG: not rendering the preview mode because of the bug in rendering
        // this mode will not affect anything
        // this.jsonPane.mode = "preview";
        // for now let us manually change to preview window using materialize plugin
        // $('ul.tabs').tabs('select_tab', 'preview-window');

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
                    console.log("progressing ", progress);
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

export default App;