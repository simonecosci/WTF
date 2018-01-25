
WTF.Abilities.Abstract = kendo.Class.extend({
    init: function (options, owner) {
        this.defaults = {
            description: "Description of the ability",
            label: "Abstract",
            cooldown: 0,
        };
        this.usable = true;
        this.owner = owner;
        this.options = $.extend(true, this.defaults, options);
    },
    use: function () {
        if (!this.usable)
            return;
        if ($.isFunction(this.options.use)) {
            return this.options.use.call(this);
        }
    },
    cooldown: function () {
        var self = this;
        self.usable = false;
        if (WTF.selection && self.owner.id === WTF.selection.id) {
            var cd = self.options.cooldown;
            WTF.toolbar.find("#ability-" + self.options.bind).find("span").text(self.options.label + "(" + cd + ")");
            (function () {
                var fn = arguments.callee;
                setTimeout(function () {
                    cd -= 1;
                    WTF.toolbar.find("#ability-" + self.options.bind).find("span").text(self.options.label + "(" + cd + ")");
                    if (cd > 0) {
                        return fn.call()
                    }
                    WTF.toolbar.find("#ability-" + self.options.bind).find("span").text(self.options.label);
                }, 1000);
            })();
        }
        self.timeout = setTimeout(function () {
            self.usable = true;
            if (WTF.selection && self.owner.id === WTF.selection.id) {
                WTF.toolbar.find("#ability-" + self.options.bind).data("kendoButton").enable(true);
                WTF.toolbar.find("#ability-" + self.options.bind).find("span").text(self.options.label);
            }
        }, self.options.cooldown * 1000);
        if (WTF.selection && self.owner.id === WTF.selection.id) {
            WTF.toolbar.find("#ability-" + self.options.bind).data("kendoButton").enable(false);
        }
    },
    damage: function (target) {
        var self = this;
        var damage = WTF.randomInt(self.options.damage.min, self.options.damage.max);
        target.stats.set("damagesTaken", target.stats.damagesTaken + damage);
        self.owner.stats.set("damagesDone", self.owner.stats.damagesDone + damage);
        target.health.set("value", target.health.value - damage);
        new WTF.Notifications.Damage(damage).show(target.position());
    },
    heal: function (target) {
        var self = this;
        var heal = WTF.randomInt(self.options.heal.min, self.options.heal.max);
        target.stats.set("healsTaken", target.stats.healsTaken + heal);
        self.owner.stats.set("healsDone", self.owner.stats.healsDone + heal);
        target.health.set("value", target.health.value + heal);
        new WTF.Notifications.Heal(heal).show(target.position());
    }

});

WTF.Abilities.Shot = WTF.Abilities.Abstract.extend({
    init: function (options, owner) {
        var options = $.extend(true, {
            description: "Shot a projectile to the target enemy dealing up " + options.damage.min +" to " + options.damage.max + " damages",
            width: 5,
            height: 5,
            speed: 150,
            range: {
                min: 0,
                max: 500
            }
        }, options);
        WTF.Abilities.Abstract.fn.init.call(this, options, owner);
    },
    use: function () {
        var self = this;
        if (!self.usable) {
            if (WTF.selection === self.owner) {
                WTF.notification.warning(self.options.label + " Not ready yet");
            }
            return;
        }
        if (!self.owner.target) {
            if (WTF.selection === self.owner) {
                WTF.notification.warning(self.options.label + " Select a target");
            }
            return;
        }
        if (self.owner.target.id === self.owner.id) {
            if (WTF.selection === self.owner) {
                WTF.notification.warning(self.options.label + " Invalid target");
            }
            return;
        }
        var distance = self.owner.distanceTo(self.owner.target.position());
        if (distance < self.options.range.min) {
            if (WTF.selection === self.owner) {
                WTF.notification.warning(self.options.label + " Target too close");
            }
            return;
        }
        if (distance > self.options.range.max) {
            if (WTF.selection === self.owner) {
                WTF.notification.warning(self.options.label + " Target too far");
            }
            return;
        }

        self.cooldown();
        var bullet = new WTF.Elements.Bullet({
            top: this.owner.position().top,
            left: this.owner.position().left,
            speed: this.options.speed,
            width: this.options.width,
            height: this.options.height
        });
        bullet.moveTo(this.owner.target.position(), {
            complete: function () {
                bullet.element.stop();
                bullet.destroy();
            }
        });
        bullet.element.on("hit", function (e, hitted) {
            if (hitted === self.owner) {
                return;
            }
            if (hitted.type && self.owner.type !== hitted.type) {
                bullet.element.stop();
                bullet.destroy();
                self.damage(hitted);
            }
        });
    }
});


WTF.Abilities.Heal = WTF.Abilities.Abstract.extend({
    init: function (options, owner) {
        var options = $.extend(true, {
            description: "Heal the friendly target up " + options.heal.min +" to " + options.heal.max + " health points",
        }, options);
        WTF.Abilities.Abstract.fn.init.call(this, options, owner);
    },
    use: function () {
        var self = this;
        if (!self.usable) {
            if (WTF.selection === self.owner) {
                WTF.notification.warning(self.options.label + " Not ready yet");
            }
            return;
        }
        if (!self.owner.target) {
            if (WTF.selection === self.owner) {
                WTF.notification.warning(self.options.label + " Select a target");
            }
            return;
        }
        if (self.owner.target.type !== self.owner.type) {
            if (WTF.selection === self.owner) {
                WTF.notification.warning(self.options.label + " Invalid target");
            }
            return;
        }
        self.heal(self.owner.target);
        self.cooldown();
    }
});