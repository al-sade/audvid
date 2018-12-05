const request = require('request');
const fs = require('fs');
const express = require('express');

const app = express();

app.get('/video', (req, res) => {
  let fileUrl = 'https://static.videezy.com/system/resources/previews/000/007/533/original/river.mp4';

  let range = req.headers.range;
  let positions, start, end, total, chunksize;

// HEAD request for file metadata
  request({
    url: fileUrl,
    method: 'HEAD'
  }, function(error, response, body){
    setResponseHeaders(response.headers);
    pipeToResponse();
  });

  function setResponseHeaders(headers){
    positions = range.replace(/bytes=/, "").split("-");
    start = parseInt(positions[0], 10);
    total = headers['content-length'];
    end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    chunksize = (end-start)+1;

    res.writeHead(206, {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type":"video/mp4"
    });
  }

  function pipeToResponse() {
    let options = {
      url: fileUrl,
      headers: {
        range: "bytes=" + start + "-" + end,
        connection: 'keep-alive'
      }
    };

    request(options).pipe(res);
  }
})

app.listen(3000, () => {
    console.log("Listening on port 3000");
})
