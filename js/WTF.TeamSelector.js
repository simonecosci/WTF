WTF.TeamSelector = {
    players: [],
    addPlayer: function(player) {
        this.players.push(new WTF.Game.Player(player));
    },

    init: function(callback) {
        var self = this;
        self.loadPlayers(function(){

            var dataSource = {
                schema: {
                    model: {
                        id: "ProductID",
                        fields: {
                            id: { editable: false, nullable: true },
                            name: { },
                            image: { },
                            health: { },
                            energy: { },
                            speed: { },
                            abilities: { },
                        }
                    }
                }
            }

            var template = '<div class="list-item-player"><div class="k-state-default player-icon" style="background-image: url(\'#: data.image #\')"></div>' +
            '<div style="float: left; width: 30%;" class="k-state-default"><b>#: data.name #</b><div>Health: #: data.health #</div><div>Energy: #: data.energy #</div><div>Speed: #: data.speed #</div></div>' + 
            '<div style="float: left; width: 50%;" class="k-state-default"><b>Abilities</b><div>#= data.abilities #</div></div>' + 
            '<hr style="clear:both"/></div>';
            self.ui = {
                element: $("#team-selector"),

                playersList: $("#team-selector").find("#players-list").css({
                    width: "100%",
                    height: 500
                }).kendoListView({
                    dataSource: dataSource,
                    dataTextField: "name",
                    dataValueField: "id",
                    template: kendo.template(template),
                    dataBound : function () {
                        this.element.find(".list-item-player").kendoDraggable({
                            hint: function (element) {
                                return element.clone();
                            }
                        });
                    }
                }).data("kendoListView"),

                team: $("#team-selector").find("#team").css({
                    width: "100%",
                    height: 200
                }).kendoListView({
                    dataTextField: "name",
                    dataValueField: "id",
                    template: kendo.template(template),
                }).data("kendoListView"),

                enemy: $("#team-selector").find("#enemy").css({
                    width: "100%",
                    height: 200
                }).kendoListView({
                    dataTextField: "name",
                    dataValueField: "id",
                    template: kendo.template(template),
                }).data("kendoListView"),
            };

            self.ui.element.find("#lists h2").text(WTF.game.options.type + " Select your players");

            var i = 0;
            self.players.forEach(element => {
                var abilities = [];
                for (var name in element.abilities) {
                    abilities.push("<b>" + element.abilities[name].options.label + "</b>: <i>" + element.abilities[name].options.description + "</i>");
                }
                self.ui.playersList.dataSource.add({
                    id: i,
                    name: element.name,
                    image: element.options.image.stop,
                    health: element.options.health.max,
                    energy: element.options.energy.max,
                    speed: element.options.speed,
                    abilities: abilities.join("<br>")
                });
                i++;
            });

            $("#team-selector").find("#team").kendoDropTargetArea({
                filter: ".list-item-player",
                drop  : function (e) {
                    var srcUid = e.draggable.element.data("uid");
                    var srcItem = this.dataSource.getByUid(srcUid);
                    if (!srcItem) {
                        dataSource.insert(srcUid, srcItem.clone());
                    }
                    e.draggable.destroy();
                }
            });

            var button = $("<button/>");
            button.attr("id", "create-match");
            button.text("Create match");
            self.ui.element.find("#teams").append(button);
            button.kendoButton({
                click: function() {
                    var number = WTF.game.options.type.split("vs")[0];
                    var data = self.ui.team.dataSource.data();
                    if (data.length !== number) {
                        alert("invalid team. Choose " + number + " player/s");
                        return;
                    }
                    if (!confirm("Do you really want to create a match using this/these " + number + " player/s ?")) {
                        return;
                    }
                    callback.call();
                }
            });
            self.ui.element.show();

        });
    },

    loadPlayers: function(callback) {
        var self = this;
        new WTF.Loader([
            "../js/WTF/Players/JohnDoe.js",
            "../js/WTF/Players/FooBarBaz.js",
        ]).load().then(function(){
            callback.call(self);
        });
    }
};