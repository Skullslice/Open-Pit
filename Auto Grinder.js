JsMacros.runScript("index.js")
var mapHeight = GlobalVars.getDouble("spawnHeight")
//sneak sometimes?
var sneak = true
//reconnect and play pit?
var reconnect = true
//lobby finder?
var finder = false
//how good does the lobby have to be for the bot to stay there?
//it is reccomended you leave this below 1
//the formula for this is (nons in middle / streakers in middle)
var quality = 0.45
//the minimum amount of irons/chains in middle for the bot to want to stay in the lobby
var minimum = 2

// Holiday Auto Grinder -->
function dist_mid() {
    const distance = Math.floor(Math.sqrt(
    Player.getPlayer().getPos()?.x ** 2 + Player.getPlayer().getPos()?.z ** 2))
    return distance
}
function get_closest() {
    //const list = Client.getMinecraft()
}

function getBotState(posX, posY, posZ) {
    if (World.isWorldLoaded() && World.getDimension() !== "minecraft:the_end") {
        var area = World.getScoreboards().getCurrentScoreboard()?.getName()
        var botwrld = area?.toString()
        if (botwrld?.includes("Pit", 0)) {
            // bot is in pit
            GlobalVars.putBoolean("isPit", true)
        }
        if (botwrld?.includes("MainScoreboard", 0) || botwrld?.includes("Prototype", 0)) {
            //bot is in hub
            GlobalVars.putBoolean("isPit", false)
            var countdown = Math.floor((GlobalVars.getObject("waitPlay") - Time.time()) / 1000)
            if (countdown >= 1) {
            Chat.log("\u00A78[\u00A7cCMD\u00A78]\u00A7a "
            + (Math.floor(countdown)))
            Client.waitTick(15)
            }
            if (GlobalVars.getObject("waitPlay") < Time.time()) {
                // this is a little glitchy so we also need to update the cooldown
                GlobalVars.putObject("waitPlay", (Time.time() + 9000))
                GlobalVars.putObject("waitHub", (Time.time() + 9000))
                Chat.say("/play pit")
                Chat.log("\u00A7aNo thanks, I like the pit better")
            }
        }
    }
    else {
        GlobalVars.putBoolean("isPit", false)
    }      
    if (World.isWorldLoaded() && World.getDimension() == "minecraft:the_end") {
        //bot is in limbo
        var countdown = Math.floor((GlobalVars.getObject("waitHub") - Time.time()) / 1000)
        if (countdown >= 1) {
        Chat.log("\u00A78[\u00A7cCMD\u00A78]\u00A76 "
        + (Math.floor(countdown)))
        Client.waitTick(15)
        }
        if (GlobalVars.getObject("waitHub") < Time.time()) {
            GlobalVars.putObject("waitHub", (Time.time() + 9000))
            GlobalVars.putObject("waitPlay", (Time.time() + 9000))
            Chat.say("/hub")
        }
    }
    else if (GlobalVars.getBoolean("majorStop")) {
        var majorCD = Math.floor((GlobalVars.getObject("endTime") - Time.time()) * 0.001)
        KeyBind.key(17, false)
        if (majorCD >= 1) {
            Chat.log("\u00A78[\u00A7bMajor Event\u00A78]\u00A76 " + majorCD)
            Chat.say(".toggle aim-assist off")
        }
        else {
            GlobalVars.putBoolean("majorStop", false)
            Chat.log("\u00A78[\u00A7cMajor Event\u00A78] \u00A7aEnded")
        }
    Client.waitTick(80)
    }
    else if (posX > 20 || posX < -20 || posZ > 20 || posZ < -20)
        {
        if (GlobalVars.getBoolean("isPit"))
            {
            Chat.log("\u00A78[\u00A7cCMD\u00A78] \u00A74Exited")
            Client.waitTick(3)
            KeyBind.key(17, false)
            Client.waitTick(2)
            Chat.say("/oof")
            Client.waitTick(25) //wait before doing anything
            }
        }
    else if (posY < mapHeight)
        {
        //Chat.log("In Bounding Box!")
        KeyBind.key(17, true)
        if (Math.random() > 0.77)
            {
            JsMacros.runScript("Jump.js")
            }
        // here we need to use a cubic expression to determine if the bot should look back to middle or not
        if (Math.random() * 2050 < (Math.abs(posX) ** 3) //reccomended to leave between 2000 - 6000
        || Math.random() * 2050 < (Math.abs(posZ) ** 3))
            {
            JsMacros.runScript("Smooth Look.js")
            //Chat.log('\u00a7cLooked')
            }
        if (Math.random() > 0.98 && sneak)
            {
            JsMacros.runScript("Sneak.js")
            }
        }
    else
        {
        KeyBind.key(17, false)
        //Chat.log("Bot is in spawn.")
        JsMacros.runScript("Smooth Look.js")
        JsMacros.runScript("Quality.js")
        Client.waitTick(6) // look at mid before doing anything
        KeyBind.key(17, true)
        while (World.isWorldLoaded() && dist_mid() > 5 && GlobalVars.getBoolean("ToggleScript")
        && dist_mid() < 30) // check if we are in spawn or script gets stopped
            {
            if (GlobalVars.getDouble("midnons") < minimum
            || GlobalVars.getDouble("midquality") < quality) {
                if (GlobalVars.getObject("waitPlay") < Time.time() && finder) {
                    KeyBind.key(17, false)
                    Client.waitTick(4)
                    GlobalVars.putObject("waitPlay", (Time.time() + 8500))
                    Chat.say("/play pit")
                }
            }
            //Chat.log('distance: ' + dist_mid())
            JsMacros.runScript("Smooth Look.js")
            KeyBind.key(17, true)
            if (dist_mid() >= 9)
                {
                JsMacros.runScript("Jump.js")
                }
            Time.sleep(250)
            }
        }
}
// Enable -->
const reverse = !GlobalVars.getBoolean("ToggleScript");
GlobalVars.putBoolean("ToggleScript", reverse);
if (reverse) {
    Chat.log("Holibot Enabled")
    JsMacros.runScript("Auto Click.js")
    } 
    else
    {
        KeyBind.key(17, false)
        Client.waitTick(3)
        Chat.log("Holibot Disabled")
        JsMacros.runScript("Auto Click.js")
        Time.sleep(3000)
        KeyBind.key(17, false)
    }
while (GlobalVars.getBoolean("ToggleScript")) {
    if (World.isWorldLoaded()) {
        var posX = Player.getPlayer().getPos()?.x
        var posY = Player.getPlayer().getPos()?.y
        var posZ = Player.getPlayer().getPos()?.z
        var currentTime = Time.time()
        //if (posX) {
        getBotState(posX, posY, posZ)
        //}
    }
    Client.waitTick(5); // wait 0.25 seconds (synchronized to client ticks)
}
