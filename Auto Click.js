const click = !GlobalVars.getBoolean("Clicker");
GlobalVars.putBoolean("Clicker", click);
var mapHeight = GlobalVars.getDouble("clickHeight");

while (GlobalVars.getBoolean("Clicker")) {
    if (GlobalVars.getBoolean("isPit") && World.isWorldLoaded()) {
        if (Player.getPlayer().getPos()?.y < mapHeight) {
            var localRand = Math.floor(Math.random() * 900 + 100)//1-10 cps KEEP THIS DEFAULT FOR NO WATCHPUPPY
            KeyBind.key(-100, true)
            Time.sleep(Math.floor(localRand / 2))
            KeyBind.key(-100, false)
            Time.sleep(Math.floor(localRand / 2))
        }
    } else {
        //wait for variables to refresh
        Time.sleep(250)
    }
}
