function toggle(ids) {
    var ele = document.getElementById(ids);
    if(ele.style.display == "block") {
        ele.style.display = "none";
    }
    else {
        ele.style.display = "block";
    }
    }


function buttonMark(ids) {
    var ele = document.getElementById(ids);
    if(ele.style.border == "2px solid black") {
        ele.style.border = "0 solid black";
    }
    else {
        ele.style.border = "2px solid black";
    }
}

