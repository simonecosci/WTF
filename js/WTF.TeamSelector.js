WTF.TeamSelector = {
    players: [],
    addPlayer: function(player) {
        this.players.push(new WTF.Game.Player(player));
    },

    init: function() {
        var self = this;
        self.loadPlayers(function(){
            var players = [];
            self.players.forEach(element => {
                var abilities = [];
                for (var name in element.abilities) {
                    abilities.push("<b>" + element.abilities[name].options.label + "</b>: <i>" + element.abilities[name].options.description) + "</i>";
                }
                players.push({
                    name: element.name,
                    image: element.options.image.stop,
                    health: element.options.health.max,
                    energy: element.options.energy.max,
                    speed: element.options.speed,
                    abilities: abilities.join("<br>")
                });
            });
            var template = '<div class="k-state-default player-icon" style="background-image: url(\'#: data.image #\')"></div>' +
            '<div style="float: left; width: 30%;" class="k-state-default"><b>#: data.name #</b><div>Health: #: data.health #</div><div>Energy: #: data.energy #</div><div>Speed: #: data.speed #</div></div>' + 
            '<div style="float: left; width: 50%;" class="k-state-default"><b>Abilities</b><div>#= data.abilities #</div></div>' + 
            '<hr style="clear:both"/>';
            self.ui = {
                element: $("#team-selector"),
                playersList: $("#team-selector").find("#players-list").css({
                    width: "100%",
                    height: 500
                }).kendoListBox({
                    dataSource: players,
                    draggable: true,
                    connectWith: "team",
                    dropSources: ["team"],
                    dataTextField: "name",
                    dataValueField: "name",
                    template: template
                }).data("kendoListBox"),
                playerDetail: $("#team-selector").find("#player-detail"),
                team: $("#team-selector").find("#team").css({
                    width: "100%",
                    height: 200
                }).kendoListBox({
                    draggable: true,
                    connectWith: "players-list",
                    dropSources: ["players-list"],
                    dataTextField: "name",
                    dataValueField: "name",
                    template: template
                }).data("kendoListBox"),
                enemy: $("#team-selector").find("#enemy").css({
                    width: "100%",
                    height: 200
                }).kendoListBox({
                    template: template
                }).data("kendoListBox"),
            };

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