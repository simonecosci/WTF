WTF.Behaviors.Abstract = kendo.Class.extend({
    init: function (options, owner) {
        this.defaults = {
            timeout: 5,
            description: "Description of the behavior",
            label: "Abstract",
        };
        this.timeout = null;
        this.owner = owner;
        this.options = $.extend(true, this.defaults, options);
    },
    behave: function () {
    },
    start: function () {
        var self = this;
        self.timeout = setInterval(function () {
            self.behave();
        }, self.options.timeout * 1000);
    },
    stop: function () {
        clearInterval(this.timeout);
    }
});

WTF.Behaviors.Tank = WTF.Behaviors.Abstract.extend({
    init: function (options, owner) {
        var options = $.extend(true, {
            description: "Attack the closest enemy",
            label: "Tank"
        }, options);
        WTF.Behaviors.Abstract.fn.init.call(this, options, owner);
    },
    behave: function() {
        var self = this;
        var closest = self.owner.closest("enemy");
        if (!closest) {
            return;
        }
        self.owner.moveTo(closest.position());
    }
});