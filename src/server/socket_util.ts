import uws from "uWebSockets.js"

export interface UserData { // data we assign to each socket, such as unique id
    ip: string
}

class SocketUtil {
    connections: Array<uws.WebSocket<UserData>>
    constructor() {
        this.connections = []
    }

    onSocketConnected(ws: uws.WebSocket<UserData>) {
        this.connections.push(ws)
        this.setUserDataForSocket(ws)
        console.log("New connection from ip " + ws.getUserData().ip)
        
    }

    setUserDataForSocket(ws: uws.WebSocket<UserData>) {
        let userData = ws.getUserData()
        let bufferedIp = ws.getRemoteAddressAsText();
        let textIp = new TextDecoder('utf-8').decode(bufferedIp)
        userData.ip = textIp
    }
}

export default SocketUtil