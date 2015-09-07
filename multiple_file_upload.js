(function($) {
    $.Editable.commands = $.extend($.Editable.commands, {
        multipleUploadFile: {
            title: "Multiple Files Upload",
            icon: "fa fa-paperclip",
            callback: function() {
                this.insertFile()
            },
            undo: false
        }
    });
    $.Editable.DEFAULTS = $.extend($.Editable.DEFAULTS, {
        allowedFileTypes: ["*"],
        fileDeleteUrl: "",
        fileDeleteParams: {},
        fileUploadParams: {},
        fileUploadURL: "http://i.froala.com/upload",
        fileUploadParam: "file",
        maxFileSize: 1024 * 1024 * 10,
        useFileName: true
    });
    $.Editable.prototype.showFileWrapper = function() {
        if (this.$file_wrapper) this.$file_wrapper.show();
    };
    $.Editable.prototype.hideFileWrapper = function() {
        if (this.$file_wrapper) {
            this.$file_wrapper.hide();
            this.$file_wrapper.find("input").blur();
        }
    };
    $.Editable.prototype.showFileUpload = function() {
        this.hidePopups();
        this.showFileWrapper();
    };
    $.Editable.prototype.insertFile = function() {
        this.closeImageMode();
        this.imageMode = false;
        this.showFileUpload();
        this.saveSelectionByMarkers();
        if (!this.options.inlineMode) this.positionPopup("multipleUploadFile");
    };
    $.Editable.prototype.fileUploadHTML = function() {
        var b = '<div class="froala-popup froala-file-popup" style="display: none;"><h4><span data-text="true">Upload file</span><i title="Cancel" class="fa fa-times" id="f-file-close-' + this._id + '"></i></h4>';
        b += '<div id="f-file-list-' + this._id + '">';
        b += '<div class="f-popup-line drop-upload">';
        b += '<div class="f-upload" id="f-file-upload-div-' + this._id + '"><strong data-text="true">Drop File</strong><br>(<span data-text="true">or click</span>)<form target="file-frame-' + this._id + '" enctype="multipart/form-data" encoding="multipart/form-data" action="' + this.options.multipleFilesUploadURL + '" method="post" id="f-file-form-' + this._id + '"><input id="f-file-upload-' + this._id + '" type="file" name="' + this.options.multipleFilesUploadParam + '" accept="/*" multiple></form></div>';
        if (this.browser.msie && $.Editable.getIEversion() <= 9) {
            b += '<iframe id="file-frame-' + this._id + '" name="file-frame-' + this._id + '" src="javascript:false;" style="width:0; height:0; border:0px solid #FFF; position: fixed; z-index: -1;" data-loaded="true"></iframe>';
        }
        b += "</div>";
        b += "</div>";
        b += '<p class="f-progress" id="f-file-progress-' + this._id + '"><span></span></p>';
        b += "</div>";
        return b;
    };
    $.Editable.prototype.buildFileDrag = function() {
        var b = this;
        b.$file_wrapper.on("dragover", "#f-file-upload-div-" + this._id, function() {
            $(this).addClass("f-hover");
            return false;
        });
        b.$file_wrapper.on("dragend", "#f-file-upload-div-" + this._id, function() {
            $(this).removeClass("f-hover");
            return false;
        });
        b.$file_wrapper.on("drop", "#f-file-upload-div-" + this._id, function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass("f-hover");
            b.uploadFile(e.originalEvent.dataTransfer.files);
        });
        b.$element.on("drop", function(e) {
            var files = e.originalEvent.dataTransfer.files;
            if (0 === $(".froala-element img.fr-image-move").length &&
                    e.originalEvent.dataTransfer && files && files.length) {
                if (b.isDisabled) return false;
                if (b.options.allowedImageTypes.indexOf(files[0].type.replace(/image\//g, "")) < 0) {
                    b.closeImageMode();
                    b.hide();
                    b.imageMode = false;
                    if (!b.initialized) {
                        b.$element.unbind("mousedown.element");
                        b.lateInit();
                    }
                    b.insertMarkersAtPoint(e.originalEvent);
                    b.showByCoordinates(e.originalEvent.pageX, e.originalEvent.pageY);
                    b.uploadFile(files);
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        });
    };
    $.Editable.prototype.buildFileUpload = function() {
        this.$file_wrapper = $(this.fileUploadHTML());
        this.$popup_editor.append(this.$file_wrapper);
        this.buildFileDrag();
        var b = this;
        if (this.$file_wrapper.on("mouseup touchend", $.proxy(function(a) {
                this.isResizing() || a.stopPropagation()
            }, this)), this.addListener("hidePopups", $.proxy(function() {
                this.hideFileWrapper()
            }, this)), this.$file_progress_bar = this.$file_wrapper.find("p#f-file-progress-" + this._id), this.browser.msie && $.Editable.getIEversion() <= 9) {
            var c = this.$file_wrapper.find("iframe").get(0);
            c.attachEvent ? c.attachEvent("onload", function() {
                b.iFrameLoad()
            }) : c.onload = function() {
                b.iFrameLoad()
            }
        }
        this.$file_wrapper.on("change", 'input[type="file"]', function() {
            if (undefined !== this.files) b.uploadFile(this.files);
            else {
                var c = $(this).parents("form");
                c.find('input[type="hidden"]').remove();
                var d;
                for (d in b.options.multipleFilesUploadParams)
                    c.prepend('<input type="hidden" name="' + d + '" value="' + b.options.multipleFilesUploadParams[d] + '" />');
                b.$file_wrapper.find("#f-file-list-" + b._id).hide(), b.$file_progress_bar.show(), b.$file_progress_bar.find("span").css("width", "100%").text("Please wait!"), b.showFileUpload(), c.submit()
            }
            $(this).val("")
        });
        this.$file_wrapper.on(this.mouseup, "#f-file-close-" + this._id, $.proxy(function(e) {
            e.stopPropagation();
            e.preventDefault(),
            this.$bttn_wrapper.show();
            this.hideFileWrapper();
            this.restoreSelection();
            this.focus();
            this.hide();
        }, this));
        this.$file_wrapper.on("click", function(a) {
            a.stopPropagation();
        });
        this.$file_wrapper.on("click", "*", function(a) {
            a.stopPropagation();
        });
    };
    $.Editable.initializers.push($.Editable.prototype.buildFileUpload);
    $.Editable.prototype.sendEachFile = function(file) {
        var formData;
        if (this.drag_support.formdata) {
            formData = this.drag_support.formdata ? new FormData : null;
        }
        if (formData) {
            var paramName;
            for (paramName in this.options.multipleFilesUploadParams) {
                formData.append(paramName, this.options.multipleFilesUploadParams[paramName]);
            }
            formData.append(this.options.multipleFilesUploadParam, file);
            if (file.size > this.options.multipleMaxFileSize) {
                this.throwFileError(5);
                return false;
            }
            if (this.options.multipleAllowedFileTypes.indexOf(file.type) < 0 &&
                    this.options.multipleAllowedFileTypes.indexOf("*") < 0) {
                this.throwFileError(6);
                return false;
            }
        }
        if (formData) {
            var req;
            if (this.options.crossDomain) {
                req = this.createCORSRequest("POST", this.options.multipleFilesUploadURL);
            } else {
                req = new XMLHttpRequest;
                req.open("POST", this.options.multipleFilesUploadURL);
                for (var f in this.options.headers) {
                    req.setRequestHeader(f, this.options.headers[f])
                }
            }
            var fileName = file.name;
            req.onload = $.proxy(function() {
                this.$file_progress_bar.find("span").css("width", "100%").text("Please wait!");
                try {
                    req.status >= 200 && req.status < 300 ? this.parseFileResponse(req.responseText, fileName) : this.throwFileError(3)
                } catch (a) {
                    this.throwFileError(4)
                }
            }, this);
            req.onerror = $.proxy(function() {
                this.throwFileError(3)
            }, this);
            req.upload.onprogress = $.proxy(function(a) {
                if (a.lengthComputable) {
                    var b = a.loaded / a.total * 100 | 0;
                    this.$file_progress_bar.find("span").css("width", b + "%")
                }
            }, this);
            req.send(formData);
            this.$file_wrapper.find("#f-file-list-" + this._id).hide();
            this.$file_progress_bar.show();
            this.showFileUpload();
        }
    };
    $.Editable.prototype.uploadFile = function(files) {
        if (!this.triggerEvent("beforeFileUpload", [files], false)) return false;
        if (undefined !== files && files.length > 0) {
            for (var i = 0; i < files.length; i++) this.sendEachFile(files[i]);
        }
    };
    $.Editable.prototype.throwFileError = function(a) {
        var b = "Unknown file upload error.";
        1 == a ? b = "Bad link." : 2 == a ? b = "No link in upload response." : 3 == a ? b = "Error during file upload." : 4 == a ? b = "Parsing response failed." : 5 == a ? b = "File too large." : 6 == a ? b = "Invalid file type." : 7 == a && (b = "File can be uploaded only to same domain in IE 8 and IE 9."), this.triggerEvent("fileError", [{
            code: a,
            message: b
        }], false), this.hideFileLoader()
    };
    $.Editable.prototype.hideFileLoader = function() {
        this.$file_progress_bar.hide();
        this.$file_progress_bar.find("span").css("width", "0%").text("");
        this.$file_wrapper.find("#f-file-list-" + this._id).show();
    };
    $.Editable.prototype.throwFileErrorWithMessage = function(msg) {
        this.triggerEvent("fileError", [{
            message: msg,
            code: 0
        }], false), this.hideFileLoader()
    };
    $.Editable.prototype.parseFileResponse = function(responseText, fileName) {
        try {
            if (!this.triggerEvent("afterFileUpload", [responseText], false)) return false;
            var responseJson = $.parseJSON(responseText);
            responseJson.link ? this.writeFile(responseJson.link, fileName, responseText) : responseJson.error ? this.throwFileErrorWithMessage(responseJson.error) : this.throwFileError(2)
        } catch (e) {
            this.throwFileError(4)
        }
    };
    $.Editable.prototype.writeFile = function(fileUrl, fileName, responseText) {
        this.restoreSelectionByMarkers();
        this.focus();
        if (!this.options.multipleUseFileName && "" !== this.text()) {
            fileName = this.text();
        }
        this.insertHTML('<a class="fr-file" href="' + this.sanitizeURL(fileUrl) + '">' + fileName + "</a>");
        this.insertHTML('<br>');
        this.hide();
        this.hideFileLoader();
        this.focus();
        this.triggerEvent("fileUploaded", [fileName, fileUrl, responseText]);
    }
})(jQuery);
