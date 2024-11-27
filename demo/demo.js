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

let zd01 = create_zoomdata( document.querySelector("#example01") );

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