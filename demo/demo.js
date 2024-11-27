/************ INTRO SECTION **************/

let intro_zd = create_zoomdata(
            document.querySelector("#intro_container"),
            {
                max_zoomfactor: 3.35,
                auto_drag_cursor: true,
                auto_zoom_cursor: true,
                prevent_scroll_on_mousewheel: "always"
            }
        );

        let circle = document.querySelector("#intro_circle")

        intro_zd.register_object({
            x: "50%",
            y: "50%",
            width: 150, height: 150,
            attach_to: circle
        });

        for (let dash of document.querySelectorAll(".horizontal-dash")) {

            if (dash.classList.contains("no-zoom")) {
                dash.style.top = dash.getAttribute("data-pos") + "%";
            } else {

                intro_zd.register_object({
                    x: 0, y: dash.getAttribute("data-pos") + "%",
                    width: "100%", height: 0,
                    attach_to: dash
                });

            }

        }

        for (let dash of document.querySelectorAll(".vertical-dash")) {

            if (dash.classList.contains("no-zoom")) {
                dash.style.left = dash.getAttribute("data-pos") + "%";
            } else {

                intro_zd.register_object({
                    x: dash.getAttribute("data-pos") + "%", y: 0,
                    width: 0, height: "100%",
                    attach_to: dash
                });

            }

        }

        intro_zd.onupdate = draw_intro;

        draw_intro();

        function draw_intro() {

            circle.style.left = circle.zoomdata.percent.x + "%";
            circle.style.top = circle.zoomdata.percent.y + "%";
            circle.style.width = circle.zoomdata.width + "px";
            circle.style.height = circle.zoomdata.height + "px";
            circle.style.fontSize = intro_zd.zoomed(20) + "px";

            for (let dash of document.querySelectorAll(".horizontal-dash:not(.no-zoom)")) {
                dash.style.top = dash.zoomdata.percent.y + "%";
                dash.style.borderTop = intro_zd.zoomed(1) + "px dashed white";
            }
            for (let dash of document.querySelectorAll(".vertical-dash:not(.no-zoom)")) {
                dash.style.left = dash.zoomdata.percent.x + "%";
                dash.style.borderLeft = intro_zd.zoomed(1) + "px dashed white";
            }
        }


/************ BASIC USAGE SECTION **************/

let zd01 = create_zoomdata(
    document.querySelector("#example01"), {prevent_scroll_on_mousewheel:"always"}
);

let child01 = document.querySelector("#example01 .child");

zd01.register_object({
    attach_to: child01,
    x: 100,
    y: 100,
    width: 200,
    height: 200
});

zd01.onupdate = function(){
    child01.style.left = child01.zoomdata.x + "px";
    child01.style.top = child01.zoomdata.y + "px";
    child01.style.width = child01.zoomdata.width + "px";
    child01.style.height = child01.zoomdata.height + "px";
}

zd01.onupdate();


/************ PERCENTAGE SECTION **************/

let zd02 = create_zoomdata(
    document.querySelector("#example02"), {prevent_scroll_on_mousewheel:"always"}
);

let child02 = document.querySelector("#example02 .child");

zd02.register_object({
    attach_to: child02,
    x: "25%",
    y: "50%",
    width: "50%"
});

zd02.onupdate = function(){
    child02.style.left = child02.zoomdata.percent.x + "%";
    child02.style.top = child02.zoomdata.percent.y + "%";
    child02.style.width = child02.zoomdata.percent.width + "%";
}

zd02.onupdate();


/************ CANVAS SECTION **************/

let cnv = document.querySelector("#example03");
resize_canvas();
window.addEventListener("resize", resize_canvas);
function resize_canvas() {
    cnv.height = cnv.parentElement.offsetHeight;
    // cnv.width = window.innerWidth / 2;
    cnv.width = document.querySelector("#example02").offsetWidth;
}

let zd03 = create_zoomdata(
    document.querySelector("#example03"), {prevent_scroll_on_mousewheel:"always"}
);


let child03_zd = zd03.register_object({
    x: "25%",
    y: "50%",
    width: "50%"
});

let ctx = cnv.getContext("2d");

ctx.fillStyle = "#CCC";
ctx.strokeStyle = "#FFF";

zd03.onupdate = function(){
    ctx.fillRect(0 , 0 , ctx.canvas.width , ctx.canvas.height);
    ctx.strokeRect(child03_zd.x , child03_zd.y - child03_zd.width / 2 , child03_zd.width , child03_zd.width);
}

zd03.onupdate();


/************ ZOOMFACTOR SECTION **************/

let zd04 = create_zoomdata(
    document.querySelector("#example04"), {
        prevent_scroll_on_mousewheel:"always",
        max_zoomfactor:5
    }
);

let children04 = document.querySelectorAll("#example04 .child");

zd04.register_object({
    attach_to: children04[0],
    x: "37.5%",
    y: "40%",
    width: "25%"
});

zd04.register_object({
    attach_to: children04[1],
    x: "37.5%",
    y: "60%",
    width: "25%"
});

zd04.onupdate = function(){

    for (child of children04) {
        child.style.left = child.zoomdata.percent.x + "%";
        child.style.top = child.zoomdata.percent.y + "%";
        child.style.width = child.zoomdata.percent.width + "%";
    }
    
    children04[1].style.borderWidth = children04[1].zoomdata.zoomed(3) + "px";
    children04[1].style.fontSize = children04[1].zoomdata.zoomed(15) + "px";
    children04[1].style.padding = children04[1].zoomdata.zoomed(10) + "px";
}

zd04.onupdate();