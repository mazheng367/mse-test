const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const size = 5 * 1024000;
const videoBuffer = fs.readFileSync(path.join(__dirname, "saga-rev-frag.mp4"));
const bufferCount = Math.ceil(videoBuffer.length / size);
//
const server = new WebSocket.Server({ noServer: true, port: 9999 });

server.on("listening", () => console.log("server start!!!"));

server.on("connection", (client) => {

    client.on("message", function (data) {
        if (data !== "start") {
            return;
        }

        let chunkIndex = 0;

        function sendData() {
            const noSendDataLen = videoBuffer.length - chunkIndex * size;

            if (noSendDataLen <= 0) {
                client.send("end");
                return;
            }

            let bufferSize = size;
            if (noSendDataLen < size) {
                bufferSize = noSendDataLen;
            }
            const startIndex = chunkIndex * size;
            let sendBuffer = videoBuffer.subarray(startIndex, startIndex + bufferSize);
            client.send(sendBuffer, () => {
                chunkIndex++;
                sendData();
            });
        }

        sendData();
    })

});