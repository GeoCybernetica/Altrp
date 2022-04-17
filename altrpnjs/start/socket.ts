import Ws from 'App/Services/Ws'
import getSocketUser from "../helpers/getSocketUser";

Ws.boot()

Ws.io.on("connection", async (socket) => {
  if(getSocketUser(socket)) {
    const guid = await Ws.pushClient(socket)

    socket.on("disconnect", () => {
      Ws.removeClient(guid, socket)
    })

    // socket.on("message", (message) => {
    // })
  }
})
