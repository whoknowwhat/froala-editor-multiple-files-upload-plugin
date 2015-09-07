# Froala Editor Multiple Files Upload Plugin
================

Override same options of the file upload plugin.

<code>
{
    allowedFileTypes: ["*"],
    fileDeleteUrl: "",
    fileDeleteParams: {},
    fileUploadParams: {},
    fileUploadURL: "http://i.froala.com/upload",
    fileUploadParam: "file",
    maxFileSize: 1024 * 1024 * 10,
    useFileName: true
}
</code>

## How to use

Put multiple_file_upload.js on js/plugin directory.
Then, import the script and add 'multipleUploadFile' to 'button' variable.
