var player = World.getLoadedPlayers().toArray();
var onlineOps = [];

function getOps() {
    onlineOps = [];
    for (var i = 0; i < opposition.length; i++) {
        for (var j = 0; j < player.length; j++) {
            if (player[j].getName().toString().toUpperCase().includes(opposition[i].toUpperCase())) {
                onlineOps.push({name: opposition[i], distance: getDistance(opposition[i]), leggings: getLeggings(opposition[i])});
            }
        }
    }
    if (onlineOps.length == 0) onlineOps.push({name: "You are the only opp in the lob!", distance: "", leggings: ""});
    return onlineOps;
}

function getLeggings(opname) {
    var lives = 1;
    var leggings = " ";
    for (i = 0; i < player.length; i++) {
        if (player[i].toString().toUpperCase().includes(opname.toUpperCase())) {
        lives = parseLives(player[i].getLegArmor().getNBT().toString());
            if (player[i].getLegArmor().getNBT().toString().includes("regularity")) leggings = "\u00A78REGULARITY" + "\u00A77 " + lives;
            if (player[i].getLegArmor().getNBT().toString().includes("venom")) leggings = "\u00A78VENOM" + "\u00A77 " + lives;
            if (player[i].getLegArmor().toString().includes("diamond")) leggings = "\u00A78DIAMOND";
        }
    }
    return leggings;
}

function getDistance(opname) {
    var x = 0;
    var y = 0;
    var z = 0;
    for (i = 0; i < player.length; i++) {
        if (player[i].toString().toUpperCase().includes(opname.toUpperCase())) {
            x = Math.abs(player[i].getX() - player[0].getX());
            y = Math.abs(player[i].getY() - player[0].getY());
            z = Math.abs(player[i].getZ() - player[0].getZ());
        }
    }
    return Math.floor(Math.sqrt(x * x + y * y + z * z));
}

function parseLives(str) {
    var startIndex = str.indexOf("Lives");
    if (startIndex !== -1) {
        var restOfString = str.slice(startIndex);
        var endIndex = restOfString.indexOf(",", (restOfString.indexOf(",") + 1)); // Find the second comma
        if (endIndex !== -1) {
            var livesString = restOfString.slice(0, endIndex);
            var numbers = livesString.match(/\d+/g); // Extract numbers
            if (numbers && numbers.length >= 2) {
                return numbers[0] + "/" + numbers[1]; // Return as fraction
            }
        }
    }
    return str;
}

function runChat() {
    getOps();
    for (i = 0; i < onlineOps.length; i++) {
        Chat.log("\u00A7d" + onlineOps[i].name + "\u00A7a " + onlineOps[i].distance + " " + onlineOps[i].leggings);
    }
}
var opposition = [
    "quadedit",
    "seturn",
    "shootafrom63rd",
    "rayzor",
    "ezsmoked",
    "seql",
    "wesi",
    "qarod",
    "bikkie",
    "foreverrich_",
    "mcstitch666",
    "mcstitchv2",
    "RingMinging",
    "CitySquare",
    "Venompitv2",
    "fatcatwitharat80"
]
runChat();
//Chat.actionbar("\u00A7d" + getOps()[0].name + "\u00A74 " + getOps()[0].distance)