(function ($, kendo) {

    var WTF = {
        game: null,
        stage: null,
        panels: {},
        selection: null,
        markStyle: {
            selection: {
                "border": "2px solid navy"
            },
            target: {
                "border": "2px solid black"
            },
            unselected: {
                "border": "2px transparent"
            }
        },
        objects: [],
        players: {
            team: [],
            enemy: []
        },
        find: function(id) {
            var i = WTF.objects.findIndex(function(element){
                return element.id === id;
            });
            return WTF.objects[i];
        },
        distance: function (p1, p2) {
            var a = p1.left - p2.left;
            var b = p1.top - p2.top;
            var d = parseInt(Math.abs(Math.sqrt(a * a + b * b)));
            return d;
        },
        getPositions: function (o) {
            var pos = {
                left: parseInt(o.element.css("left")),
                top: parseInt(o.element.css("top"))
            };
            return [[pos.left, pos.left + o.width], [pos.top, pos.top + o.height]];
        },
        comparePositions: function (p1, p2) {
            var r1, r2;
            r1 = p1[0] < p2[0] ? p1 : p2;
            r2 = p1[0] < p2[0] ? p2 : p1;
            return r1[1] > r2[0] || r1[0] === r2[0];
        },
        overlaps: function (a, b) {
            var pos1 = this.getPositions(a),
                pos2 = this.getPositions(b);
            return this.comparePositions(pos1[0], pos2[0]) && this.comparePositions(pos1[1], pos2[1]);
        },
        randomInt: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
    };

    WTF.Abilities = {};

    WTF.Elements = {};

    WTF.Notifications = {};

    WTF.Loader = function (scripts) {
        var self = this;
        this.callback = function () { };
        this.scripts = scripts.reverse();
        this.load = function () {
            if (this.scripts.length === 0) {
                this.callback.call();
                return this;
            }
            var script = this.scripts.pop();
            $.getScript(script, function () {
                self.load();
            }).fail(function(){
                if(arguments[0].readyState==0){
                    //script failed to load
                }else{
                    //script loaded but failed to parse
                    alert(arguments[2].toString());
                }
            });
            return this;
        }
        this.then = function (callback) {
            this.callback = callback;
        }
    };

    $.extend(window, {
        WTF: WTF
    });
    new WTF.Loader([
        "../js/WTF.Game.js",
        "../js/WTF.Game.Object.js",
        "../js/WTF.Game.Player.js",
        "../js/WTF.Abilities.js",
        "../js/WTF.Elements.js",
        "../js/WTF.Notifications.js",
        "../js/WTF.TeamSelector.js",
    ]).load().then(function(){
        $(WTF).trigger("gameready");
    });


})(jQuery, kendo);