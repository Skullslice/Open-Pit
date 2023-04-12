if (World.isWorldLoaded()) {
const username = Player.getPlayer().getName().toString()
const nameFormatted = username.substring(21, username.length - 2)
setWindowTitle("[Holibot v1.2.0] > " + nameFormatted)
}

function setWindowTitle(title) {
    mc = Client.getMinecraft()
    getWindow = Reflection.getDeclaredMethod(mc.getClass(), "method_22683")
    window = getWindow.invoke(mc)
    window.method_24286(title)
}
















