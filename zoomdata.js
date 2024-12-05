/*** zoomdata.js *** v1.0 *** auer404 ***/

function create_zoomdata(target_element, options = {}) {

    let zd = {
        owner: target_element,
        zoomfactor: 1, max_zoomfactor: options.max_zoomfactor || 2,
        prev_zoomfactor: 1,
        x: 0, y: 0,
        height: 0, width: 0,
        mouse_x: 0, mouse_y: 0,
        zoom_origin_x: 0, zoom_origin_y: 0,
        relative_zoom_origin_x: 0, relative_zoom_origin_y: 0,
        zoomout_origin_x: 0, zoomout_origin_y: 0,
        relative_zoomout_origin_x: 0, relative_zoomout_origin_y: 0,
        zoom_timeout: false,
        mouse_down: false, drag_key_down: false, zoom_key_down: false,
        dragstart_mouse_x: 0, dragstart_mouse_y: 0,
        dragstart_x: 0, dragstart_y: 0,
        objects: [], objects_to_update: [], resize_sensitive_objects: [],
        scroll_lock: false,
        mousewheel_triggered: false, mousewheel_cooldown_timeout: false,
        options: options,

        setup: function () {

            this.height = this.owner.getBoundingClientRect().height * this.zoomfactor;
            this.width = this.owner.getBoundingClientRect().width * this.zoomfactor;

            if (this.options.mouse_based_zoom_origin == false || (this.options.zoom_on_mousewheel == false && this.options.mouse_based_zoom_origin != true)) {
                this.zoom_origin_x = Math.round(this.owner.getBoundingClientRect().width / 2);
                this.zoom_origin_y = Math.round(this.owner.getBoundingClientRect().height / 2);
            } else {
                this.zoom_origin_x = this.mouse_x;
                this.zoom_origin_y = this.mouse_y;
            }

            this.relative_zoom_origin_x = this.zoom_origin_x / this.owner.getBoundingClientRect().width;
            this.relative_zoom_origin_y = this.zoom_origin_y / this.owner.getBoundingClientRect().height;

            this.owner.addEventListener("mouseenter", this.update_mouse_xy.bind(this));
            this.owner.addEventListener("mousemove", this.update_mouse_xy.bind(this));

            this.owner.addEventListener("mouseleave", function () {
                if (this.options.mouse_based_zoom_origin != false && this.options.zoom_on_mousewheel != false) {
                    this.set_zoom_origin(0, 0);
                }
            }.bind(this));

            this.owner.addEventListener("wheel", function (e) {
                if (this.zoomdata.options.zoom_on_mousewheel != false) {

                    if (this.zoomdata.mouse_x <= this.zoomdata.x || this.zoomdata.mouse_y <= this.zoomdata.y) {
                        return;
                    }

                    clearTimeout(zd.mousewheel_cooldown_timeout);
                    zd.mousewheel_triggered = true;
                    zd.mousewheel_cooldown_timeout = setTimeout(function () {
                        zd.mousewheel_triggered = false;
                        zd.scroll_lock = false;
                    }, 250);

                    zd.update_mouse_xy.bind(zd)(e);

                    if (zd.zoom_key_down || !zd.options.zoom_key) {
                        if (zd.zoom(zd.zoomfactor + e.deltaY * -0.05) && zd.options.prevent_scroll_on_mousewheel != false) {
                            zd.scroll_lock = true;
                        }
                    }
                    if (zd.scroll_lock || zd.options.prevent_scroll_on_mousewheel == "always") {
                        e.preventDefault();
                    }
                }
            });

            this.owner.addEventListener("mousedown", function () {
                zd.mouse_down = true;
                if (zd.options.allow_drag != false && (zd.drag_key_down || !zd.options.drag_key)) {
                    zd.refresh_drag_coords();
                    if (zd.zoomfactor > 1) {
                        zd.auto_cursor("grabbing", "drag");
                    }
                }
            });

            window.addEventListener("mouseup", function () {
                zd.mouse_down = false;
                if (zd.zoomfactor > 1 && zd.options.allow_drag != false) {
                    if (zd.drag_key_down) {
                        zd.auto_cursor("grab", "drag");
                    } else {
                        if (zd.options.auto_notallowed_cursor == "revert" || (zd.options.auto_nnotallowed_cursor == undefined && zd.options.drag_key == undefined)) {
                            zd.auto_cursor("", "drag");
                        } else if (zd.options.auto_notallowed_cursor == "always" || (zd.options.auto_notallowed_cursor != false && options.auto_notallowed_cursor != "revert" && zd.options.drag_key != false && zd.options.drag_key != undefined)) {
                            zd.auto_cursor("not-allowed", "drag");
                        }
                    }
                } else {
                    if (zd.drag_key_down || !zd.drag_key) {
                        zd.auto_cursor("", "drag", true);
                    }
                }

            }
            );

            this.owner.addEventListener("contextmenu", function () {
                zd.mouse_down = false;
            });

            if (this.options.drag_key !== false && this.options.allow_drag != false) {

                window.addEventListener("keydown", function (e) {
                    if (e.code == zd.options.drag_key || e.key == zd.options.drag_key) {
                        zd.drag_key_down = true;
                        if (zd.zoomfactor > 1) {
                            if (!zd.mouse_down) {
                                zd.auto_cursor("grab", "drag");
                            } else {
                                zd.auto_cursor("grabbing", "drag");
                                zd.refresh_drag_coords();
                            }
                        } else {
                            if (zd.options.auto_notallowed_cursor == "revert") {
                                zd.auto_cursor("", "drag");
                            } else if (zd.options.auto_notallowed_cursor == "always" || (zd.options.auto_notallowed_cursor != false && options.auto_notallowed_cursor != "revert" && zd.options.drag_key != false)) {
                                zd.auto_cursor("not-allowed", "drag", true);
                            }
                        }
                        zd.ondragkeydown();
                    }
                    if (e.code == zd.options.zoom_key || e.key == zd.options.zoom_key) {
                        zd.zoom_key_down = true;
                        if (!zd.mousewheel_triggered) {
                            zd.auto_cursor("zoom-in", "zoom");
                        }
                        zd.onzoomkeydown();
                    }
                });

                window.addEventListener("keyup", function (e) {
                    if (e.code == zd.options.drag_key || e.key == zd.options.drag_key) {
                        zd.drag_key_down = false;
                        zd.auto_cursor("", "drag", true);
                        zd.ondragkeyup();
                    }
                    if (e.code == zd.options.zoom_key || e.key == zd.options.zoom_key) {
                        zd.zoom_key_down = false;
                        zd.auto_cursor("", "zoom", true);
                        zd.onzoomkeyup();
                    }
                });

            }

            this.owner.addEventListener("mousemove", function () {

                if (zd.options.allow_drag != false && zd.mouse_down && (zd.drag_key_down || !zd.options.drag_key)) {

                    let distance_x = zd.mouse_x - zd.dragstart_mouse_x;
                    let distance_y = zd.mouse_y - zd.dragstart_mouse_y;

                    let new_x = zd.dragstart_x + distance_x;
                    let new_y = zd.dragstart_y + distance_y;

                    zd.move_to(new_x, new_y, zd.refresh_drag_coords);

                    if (zd.zoomfactor <= 1) {
                        if (zd.options.auto_notallowed_cursor == "always" || zd.options.auto_notallowed_cursor != false && options.auto_notallowed_cursor != "revert") {
                            zd.auto_cursor("not-allowed", "drag", true);
                        }
                    }

                }
            });


            new ResizeObserver(function () {

                zd.update_zoom_values();

                if (zd.options.auto_update_objects != false) {

                    for (obj of zd.resize_sensitive_objects) {
                        obj.update_zoom_values();
                    }
                }

                zd.onresizeowner();

            }).observe(this.owner);

        },

        set_zoom_origin: function (x = false, y = false) {
            if (x !== false) {
                this.zoom_origin_x = this.check_percent(x, this.owner.getBoundingClientRect().width).pixels;
            }
            if (y !== false) {
                this.zoom_origin_y = this.check_percent(y, this.owner.getBoundingClientRect().height).pixels;
            }
            if (x !== false || y !== false) {
                this.update_relative_zoom_origin_xy();
            }
        },

        update_mouse_xy: function (e) {

            this.mouse_x = e.clientX - this.owner.getBoundingClientRect().x;
            this.mouse_y = e.clientY - this.owner.getBoundingClientRect().y;

            if (this.mouse_x < this.x) {
                this.mouse_x = this.x;
            }
            if (this.mouse_y < this.y) {
                this.mouse_y = this.y;
            }
            if (this.mouse_x > this.x + this.width) {
                this.mouse_x = this.x + this.width;
            }
            if (this.mouse_y > this.y + this.height) {
                this.mouse_y = this.y + this.height
            }

            if (this.options.mouse_based_zoom_origin != false && this.options.zoom_on_mousewheel != false) {
                this.set_zoom_origin(this.mouse_x, this.mouse_y);
            }

        },

        update_relative_zoom_origin_xy: function () {
            this.relative_zoom_origin_x = (this.zoom_origin_x - this.x) / this.width;
            this.relative_zoom_origin_y = (this.zoom_origin_y - this.y) / this.height;
        },

        update_zoomout_origin_xy: function () {

            this.zoomout_origin_x = (- this.x * this.owner.getBoundingClientRect().width) / (this.width - this.owner.getBoundingClientRect().width) || 0;
            this.zoomout_origin_y = (- this.y * this.owner.getBoundingClientRect().height) / (this.height - this.owner.getBoundingClientRect().height) || 0;
            this.relative_zoomout_origin_x = (this.zoomout_origin_x - this.x) / this.width || 0;
            this.relative_zoomout_origin_y = (this.zoomout_origin_y - this.y) / this.height || 0;
        },

        update_zoomfactor: function (value) {
            return this.set_zoomfactor(this.zoomfactor + value);
        },

        set_zoomfactor: function (value) {
            if (value <= 1) {
                if (this.zoomfactor == 1) {
                    return false;
                }
                value = 1;
            } else if (value >= this.max_zoomfactor) {
                if (this.zoomfactor == this.max_zoomfactor) {
                    return false;
                }
                value = this.max_zoomfactor;
            }
            this.prev_zoomfactor = this.zoomfactor;
            this.zoomfactor = value;
            this.zoomfactor = Math.min(Math.max(1, this.zoomfactor), this.max_zoomfactor);
            return true;
        },

        update_zoom_values: function () {

            this.width = this.owner.getBoundingClientRect().width * this.zoomfactor;
            this.height = this.owner.getBoundingClientRect().height * this.zoomfactor;

            let origin_x, origin_y, rel_origin_x, rel_origin_y;

            if (this.zoomfactor > this.prev_zoomfactor) {

                origin_x = this.zoom_origin_x;
                origin_y = this.zoom_origin_y;
                rel_origin_x = this.relative_zoom_origin_x;
                rel_origin_y = this.relative_zoom_origin_y;

            } else {

                origin_x = this.zoomout_origin_x;
                origin_y = this.zoomout_origin_y;
                rel_origin_x = this.relative_zoomout_origin_x;
                rel_origin_y = this.relative_zoomout_origin_y;

            }


            let zoomed_offset_x_from_origin = rel_origin_x * this.width;
            let zoomed_offset_y_from_origin = rel_origin_y * this.height;

            this.x = 0 - (zoomed_offset_x_from_origin - origin_x);
            this.y = 0 - (zoomed_offset_y_from_origin - origin_y);

            if (this.zoomfactor < this.prev_zoomfactor && (this.x > 0 || this.zoomfactor == 1)) {
                this.x = 0;
            }

            if (this.zoomfactor < this.prev_zoomfactor && (this.y > 0 || this.zoomfactor == 1)) {
                this.y = 0;
            }

            this.update_relative_zoom_origin_xy();
            this.update_zoomout_origin_xy();

        },

        zoom: function (new_zoomfactor) {

            let prev_zoomfactor = this.zoomfactor;

            if (this.set_zoomfactor(new_zoomfactor)) {
                clearTimeout(this.zoom_timeout);
                if (new_zoomfactor > prev_zoomfactor) {
                    this.auto_cursor("zoom-in", "zoom");
                } else {
                    this.auto_cursor("zoom-out", "zoom");
                }
                this.zoom_timeout = setTimeout(function () {
                    if (!zd.zoom_key_down || !zd.options.zoom_key) {
                        zd.auto_cursor("", "zoom");
                    } else {
                        zd.auto_cursor("zoom-in", "zoom");
                    }
                }, 250);
                this.update_zoom_values();

                this.update_objects();
                this.onupdate();
                return true;
            } else {
                if (zd.options.auto_notallowed_cursor == "revert") {
                    zd.auto_cursor("", "zoom");
                } else if (zd.options.auto_notallowed_cursor == "always" || (zd.options.auto_notallowed_cursor != false && (zd.options.auto_notallowed_cursor != undefined || zd.options.auto_zoom_cursor === true) && options.auto_notallowed_cursor != "revert" && zd.options.zoom_key != false)) {

                    zd.auto_cursor("not-allowed", "zoom", true);
                    this.zoom_timeout = setTimeout(function () {
                        zd.auto_cursor("", "zoom", true);
                    }, 250);
                }
            }
            return false;
        },

        zoomed: function (value = 1) {
            return value * this.zoomfactor;
        },

        move_to: function (new_x = false, new_y = false, overflow_callback = function () { }) {

            let previous_x = this.x;
            let previous_y = this.y;

            if (new_x) {

                if (new_x > 0) {
                    this.x = 0;
                    overflow_callback();
                } else if (new_x < 0 - (this.width - this.width / this.zoomfactor)) {
                    this.x = 0 - (this.width - this.width / this.zoomfactor);
                    overflow_callback();
                } else {
                    this.x = new_x;
                }

            }

            if (new_y) {

                if (new_y > 0) {
                    this.y = 0;
                    overflow_callback();
                } else if (new_y < 0 - (this.height - this.height / this.zoomfactor)) {
                    this.y = 0 - (this.height - this.height / this.zoomfactor);
                    overflow_callback();
                } else {
                    this.y = new_y;
                }

            }

            this.update_relative_zoom_origin_xy();
            this.update_zoomout_origin_xy();

            if (this.x != previous_x || this.y != previous_y) {
                this.update_objects();
                this.onupdate();
            }

        },

        move_by: function (dist_x, dist_y, overflow_callback = function () { }) {

            let new_x = this.x + dist_x;
            let new_y = this.y + dist_y;
            this.move_to(new_x, new_y, overflow_callback);

        },

        refresh_drag_coords: function () {
            this.dragstart_mouse_x = this.mouse_x;
            this.dragstart_mouse_y = this.mouse_y;
            this.dragstart_x = this.x;
            this.dragstart_y = this.y;

        },

        auto_cursor: function (cursor_name, context, force = false) {

            if (this.options["auto_" + context + "_cursor"] === true || force === true) {
                this.owner.style.cursor = cursor_name;
            }

        },

        check_percent: function (input, dimension) {
            if (typeof input == "string" && input.indexOf("%") != -1) {
                let splitted = input.split("%");
                let val = Number(splitted[0]);
                return {
                    pixels: val * dimension / 100,
                    percent: val
                };
            }
            return {
                pixels: input,
                percent: false
            };
        },

        register_object: function (param_obj) {
            let obj = {}

            obj.multiplicator = param_obj.multiplicator || 1;

            let x_check = zd.check_percent(param_obj.x, zd.owner.getBoundingClientRect().width);
            let y_check = zd.check_percent(param_obj.y, zd.owner.getBoundingClientRect().height);
            let w_check = zd.check_percent(param_obj.width, zd.owner.getBoundingClientRect().width)
            let h_check = zd.check_percent(param_obj.height, zd.owner.getBoundingClientRect().height);

            obj.base_x = x_check.pixels || 0;
            obj.base_y = y_check.pixels || 0;
            obj.base_width = w_check.pixels || 0;
            obj.base_height = h_check.pixels || 0;

            obj.x = obj.base_x;
            obj.y = obj.base_y;
            obj.width = obj.base_width;
            obj.height = obj.base_height;

            obj.variable_x = x_check.percent;
            obj.variable_y = y_check.percent;
            obj.variable_width = w_check.percent;
            obj.variable_height = h_check.percent;

            obj.percent = {
                x: null,
                y: null,
                width: null,
                height: null
            }

            obj.update_percent_values = function () {
                this.percent.x = this.x * 100 / zd.owner.getBoundingClientRect().width;
                this.percent.y = this.y * 100 / zd.owner.getBoundingClientRect().height;
                this.percent.width = this.width * 100 / zd.owner.getBoundingClientRect().width;
                this.percent.height = this.height * 100 / zd.owner.getBoundingClientRect().height;
            }

            obj.update_percent_values();

            obj.apply_multiplicator = function (value) {
                return 1 + this.multiplicator * (value - 1);
            }

            obj.update_zoom_values = function () {

                if (obj.variable_x) {
                    obj.base_x = obj.variable_x * zd.owner.getBoundingClientRect().width / 100;
                }
                if (obj.variable_y) {
                    obj.base_y = obj.variable_y * zd.owner.getBoundingClientRect().height / 100;
                }
                if (obj.variable_width) {
                    obj.base_width = obj.variable_width * zd.owner.getBoundingClientRect().width / 100;
                }
                if (obj.variable_height) {
                    obj.base_height = obj.variable_height * zd.owner.getBoundingClientRect().height / 100;
                }

                this.width = Math.round(this.base_width * this.apply_multiplicator(zd.zoomfactor));
                this.height = Math.round(this.base_height * this.apply_multiplicator(zd.zoomfactor));
                this.x = Math.round(this.base_x * this.apply_multiplicator(zd.zoomfactor) + this.apply_multiplicator(zd.x));
                this.y = Math.round(this.base_y * this.apply_multiplicator(zd.zoomfactor) + this.apply_multiplicator(zd.y));

                this.update_percent_values();

            }

            obj.zoomed = function (value = 1) {
                return this.apply_multiplicator(zd.zoomfactor) * value;
            }

            if (param_obj.attach_to) {
                param_obj.attach_to.zoomdata = obj;
                obj.owner = param_obj.attach_to;
            } else {
                obj.owner = null;
            }

            obj.parent = zd;

            zd.objects.push(obj);
            if (param_obj.auto_update != false) {
                zd.objects_to_update.push(obj);
                if (obj.variable_x || obj.variable_y || obj.variable_width || obj.variable_height) {
                    zd.resize_sensitive_objects.push(obj);
                }
            }

            return obj;
        },

        update_objects: function () {
            if (this.options.auto_update_objects == false) { return }
            for (o of this.objects_to_update) {
                o.update_zoom_values();
            }
        },

        onupdate: function () { },
        onresizeowner: function () { },
        onzoomkeydown: function () { },
        onzoomkeyup: function () { },
        ondragkeydown: function () { },
        ondragkeyup: function () { },

    }

    zd.setup();
    zd.owner.zoomdata = zd;
    return zd;

}