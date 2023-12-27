//@ts-check
'use strict'

const Logger = require("./Logger")

/**
 * @typedef {import("socket.io").Server} Server
 * @typedef {import("socket.io").Socket} Socket
*/

const logger = require('./Logger')('wsControl')
const app = require("../webserver/app").app
let connections = 0

/**
 * static class websocket controller, that helps communicating through websockets to different namespaces and ensures
 * that websocket events are bound, if the websocket server has been initialized (through promise made on app start)
 */
class WebsocketsController {

    /**
     * emit an event to WS
     * @param {string} event name of the event
     * @param {object} data data to emit to the client event listener
     */
    static emit(event, data) {
        app.get('io').sockets.emit(event, data)
    }

    /**
     * @returns {((event: string, data: object) => void) | null}
     */
    static emitOnConnections() {
        return connections ? this.emit : null
    }

    /**
     * add callback on WS connection
     * @param {(arg: Socket) => void} callback
     */
    static setConnectCallback(callback) {
        /**@type {Server} */
        const io = app.get('io')
        io.on('connection', socket => {
            ++connections
            logger.inf?.(`Connection from ${socket.client.conn.remoteAddress}`)
            socket.on("disconnect", (reason) => logger.inf?.(`${socket.client.conn.remoteAddress} disconnected: ${reason} *${--connections}`))
            callback(socket)
        })
    }
}

module.exports = WebsocketsController
