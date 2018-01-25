WTF.Game = function (options) {
    var self = this;

    self.options = options;
    WTF.game = self;
    WTF.toolbar = options.toolbar;
    WTF.stage = options.stage || $("body");
    if (options.background) {
        WTF.stage.css("background-image", "url(" + self.options.background + ")");
    }

    self.addPlayer = function (config) {
        var player = new WTF.Game.Player(config);
        WTF.players[config.type].push(player);
    };

    self.init = function () {

        WTF.stage.on("click", function (e) {
            e.stopPropagation();
            if (WTF.selection) {
                WTF.selection.moveTo({
                    top: e.pageY - parseInt(WTF.selection.height / 2),
                    left: e.pageX - parseInt(WTF.selection.width / 2)
                });
            }
        });

        self.options.panels
            .append($("<h2>Team</h2><div id='panel-team'/>"))
            .append($("<h2>Enemies</h2><div id='panel-enemy'/>"))
            ;
        WTF.notification = self.options.notification.kendoNotification({
            appendTo: self.options.panels,
            stacking: "down",
            position: {
                bottom: 0
            },
            autoHideAfter: 3000
        }).data("kendoNotification");

        var dataSourceTeam = [];
        WTF.players.team.forEach(element => {
            dataSourceTeam.push({
                name: element.name,
                id: element.id,
                health: element.health,
                energy: element.energy,
                stats: element.stats,
                image: element.options.image.stop
            });
        });

        WTF.panels.team = self.options.panels.find("#panel-team").kendoGrid({
            dataSource: dataSourceTeam,
            width: 300,
            selectable: true,
            change: function (e) {
                var tr = e.sender.select();
                var item = this.dataItem(tr);
                WTF.find(item.id).select();
            },
            columns: [
                {
                    title: "Player",
                    template: function (dataItem) {
                        return "<img src='" + dataItem.image + "' style='height: 30px; width: auto'>";
                    }
                }, {
                    field: "name",
                    title: "Name"
                }, {
                    title: "Damages",
                    field: "stats.damagesDone"
                }, {
                    field: "stats.healsDone",
                    title: "Heals"
                }, {
                        title: "Stats",
                    template: function (dataItem) {
                        return "<div class='playerbar energybar'></div><div class='playerbar healthbar'></div>"
                    }
                }],
            dataBound: function (e) {
                var grid = this, top = 0;
                grid.element.find(".playerbar").each(function () {
                    top += 15;
                    var row = $(this).closest("tr");
                    var model = grid.dataItem(row);
                    var field;
                    if ($(this).is(".healthbar")) {
                        field = "health";
                    }
                    if ($(this).is(".energybar")) {
                        field = "energy";
                    }
                    $(this).css({
                        width: "100px",
                        bottom: "auto",
                        top: top,
                        height: 15
                    });
                    $(this).kendoProgressBar({
                        type: "value",
                        animation: false,
                        value: model[field].value,
                        max: model[field].max,
                        change: function (e) {
                            this.progressStatus.text(e.value);
                        }
                    });
                });
            }
        }).data("kendoGrid");

        var dataSourceEnemy = [];
        WTF.players.enemy.forEach(element => {
            dataSourceEnemy.push({
                name: element.name,
                id: element.id,
                health: element.health,
                energy: element.energy,
                stats: element.stats,
                image: element.options.image.stop
            });
        });        

        WTF.panels.enemy = self.options.panels.find("#panel-enemy").kendoGrid({
            dataSource: dataSourceEnemy,
            width: 300,
            selectable: true,
            change: function (e) {
                if (!WTF.selection)
                    return;
                var tr = e.sender.select();
                var item = this.dataItem(tr);
                WTF.selection.target = WTF.find(item.id);
                WTF.selection.target.element.css(WTF.markStyle.target);
            },
            columns: [{
                title: "Player",
                template: function (dataItem) {
                    return "<img src='" + dataItem.image + "' style='height: 30px; width: auto'>";
                }
            }, {
                field: "name",
                title: "Name"
            }, {
                title: "Damages",
                field: "stats.damagesDone"
            }, {
                field: "stats.healsDone",
                title: "Heals"
            }, {
                title: "Stats",
                template: function (dataItem) {
                    return "<div class='playerbar energybar'></div><div class='playerbar healthbar'></div>"
                }
            }],
            dataBound: function (e) {
                var grid = this, top = 0;
                grid.element.find(".playerbar").each(function () {
                    top += 15;
                    var row = $(this).closest("tr");
                    var model = grid.dataItem(row);
                    var field;
                    if ($(this).is(".healthbar")) {
                        field = "health";
                    }
                    if ($(this).is(".energybar")) {
                        field = "energy";
                    }
                    $(this).css({
                        width: "100px",
                        bottom: "auto",
                        top: top,
                        height: 15
                    });
                    $(this).kendoProgressBar({
                        type: "value",
                        animation: false,
                        value: model[field].value,
                        max: model[field].max,
                        change: function (e) {
                            this.progressStatus.text(e.value);
                        }
                    });
                });
            }
        }).data("kendoGrid");

        var ondead = function (evt) {
            if (WTF.selection && WTF.selection === evt.currentTarget) {
                var target = WTF.selection.target;
                if (target) {
                    WTF.players.enemy.forEach(obj => {
                        if (obj.id === target.id) {
                            obj.element.css(WTF.markStyle.unselected);
                        }
                    });
                }
                WTF.selection = null;
            }
            if (evt.currentTarget.type === "team") {
                WTF.notification.warning(evt.currentTarget.name + " is dead");
            }
            if (evt.currentTarget.type === "enemy") {
                WTF.notification.success(evt.currentTarget.name + " is dead");
            }
        }

        WTF.players.team.forEach(o => {
            o.element.show();
            $(o).on("dead", ondead);
        });
        WTF.players.enemy.forEach(o => {
            o.element.show();
            $(o).on("dead", ondead);
        });
    }
};
