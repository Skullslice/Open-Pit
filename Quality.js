var quality = World.getLoadedPlayers().toArray()
var mc = Client.getMinecraft()
var mapHeight = 84
const average = (array) => array.reduce((a, b) => a + b) / array.length;

const qualityHud = Hud.createDraw2D()
let averageQuality;
qualityHud.setOnInit(JavaWrapper.methodToJava(() => {
    averageQuality = qualityHud.addText(average([]))
}));

//this is called every tick ->
const ticklistener = JsMacros.on("Tick", JavaWrapper.methodToJava(() => {
    averageQuality?.setText(check_lobby());
}));

//this is called when the service is stopped ->
//event.stopListener = JavaWrapper.methodToJava(() => {
    //Hud.unregisterDraw2D(qualityHud);
    //JsMacros.off(ticklistener);
//});

function check_lobby() {
    var diamonds = 0
    var nons = 0
    var streakers = 0
    var midnons = 0
    var midquality = 0
    
    for (let i = 0; i < quality.length; i++) {
        if (quality.length < 2) return 0;
        var playerX = quality[i].getX()
        var playerY = quality[i].getY()
        var playerZ = quality[i].getZ()
        var name = quality[i].toString()
        var nameFormat = name.substring(42, name.length - 30)
        var chestplate = quality[i].getChestArmor().toString()
        var boots = quality[i].getFootArmor().toString()
        if (chestplate.includes("diamond_chestplate", 0) || boots.includes("diamond_boots", 0)) {
            diamonds++
            if (playerX < 11 && playerX > -11 && playerZ < 11 && playerZ > -11 && playerY < mapHeight) {  
                streakers++
            }
        }
        else {
            nons++
            if (playerX < 11 && playerX > -11 && playerZ < 11 && playerZ > -11 && playerY < mapHeight) {
                midnons++
            }
        }
    }
    midquality = midnons / streakers
    //midquality = midnons
    Chat.log("Nons: " + midnons)    
    GlobalVars.putDouble("midquality", midquality)
    GlobalVars.putDouble("streakers", streakers)
    GlobalVars.putDouble("nons", nons)
    GlobalVars.putDouble("midnons", midnons)
    GlobalVars.putDouble("diamonds", diamonds)
    return midquality
}

function getAvg() {
    return 10
}
check_lobby()













