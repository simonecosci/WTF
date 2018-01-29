WTF.Behaviors.Abstract = kendo.Class.extend({
    init: function (options, owner) {
        this.defaults = {
            timeout: 5,
            description: "Description of the behavior",
            label: "Abstract",
        };
        this.priority = [];
        this.timeout = null;
        this.owner = owner;
        this.options = $.extend(true, this.defaults, options);
    },
    check: function() {
        if (self.owner === WTF.selection) {
            this.stop();
            return false;
        }
        return true;
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
    },
    use: function (ability) {
        var self = this;
        if (!ability.usable) {
            return;
        }
        if (ability.options.range) {
            var distance = self.owner.distanceTo(closest);
            if (ability.options.range.min < distance) {
                if (closest.position().left < self.owner.poisition().left) {
                    self.owner.moveTo({
                        top: closest.position().top,
                        left: self.owner.poisition().left + (ability.options.range.min - distance)
                    });
                } else if (closest.position().left > self.owner.poisition().left) {
                    self.owner.moveTo({
                        top: closest.position().top,
                        left: self.poisition().left - (ability.options.range.min + distance)
                    });
                }
            } else if (ability.options.range.max > distance) {
                self.owner.moveTo(closest);
            } else {
                ability.use();
            }
        } else {
            ability.use();
        }
    },
});

WTF.Behaviors.Tank = WTF.Behaviors.Abstract.extend({

    init: function (options, owner) {
        var options = $.extend(true, {
            description: "Attack the closest enemy",
            label: "Tank"
        }, options);
        WTF.Behaviors.Abstract.fn.init.call(this, options, owner);
        this.priority = [
            WTF.AbilityTypes.Defense,
            WTF.AbilityTypes.Attack,
            WTF.AbilityTypes.Heal
        ];
    },

    behave: function () {
        if (!this.check())
            return;
        var self = this;
        var type = self.owner.type === "enemy" ? "team" : "enemy";
        var closest = self.owner.closest(type);
        if (!closest) {
            return;
        }
        self.owner.target = closest;
        for (var a in self.owner.abilities) {
            var ability = self.owner.abilities[a];
            self.priority.forEach(priority => {
                if (ability.type === priority) {
                    self.use(ability);
                }
            });
        };
    }
});