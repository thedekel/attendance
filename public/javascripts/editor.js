(function(){
  var editor, mode = {'edit':0, 'preview':1}, editbtn, previewbtn,
      editorArea;
  editor = document.getElementById("editor");
  editbtn = document.getElementById("editbtn");
  previewbtn = document.getElementById("previewbtn");
  editorArea = document.getElementById("description");
  editor.mode = mode.edit;
  editbtn.onclick = function(e){
    var editpreview = document.getElementById("editorPreview");
    if (editor.mode === mode.edit){
      return;
    }
    console.log('edit');
    previewbtn.classList.remove("selected");
    editbtn.classList.add("selected");
    editor.mode = mode.edit;
    editor.removeChild(editorPreview);
    editorArea.style.setProperty("display","block");
  };
  previewbtn.onclick = function(e){
    var newpreview;
    if (editor.mode === mode.preview){
      return;
    }
    console.log('preview');
    editbtn.classList.remove("selected");
    previewbtn.classList.add("selected");
    editor.mode = mode.preview;
    editorArea.style.setProperty("display","none");
    newpreview = document.createElement("div");
    newpreview.setAttribute("id", "editorPreview");
    newpreview.innerHTML = marked(editorArea.value);
    editor.appendChild(newpreview);
  };
 }());
