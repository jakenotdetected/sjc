const fs = require("fs");
const http = require("http");
const path = require("path");

const port = Number(process.env.PORT || 19006);
const root = path.join(__dirname, "dist");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".css": "text/css"
};

http
  .createServer((request, response) => {
    let urlPath = decodeURIComponent(request.url.split("?")[0]);
    if (urlPath === "/") {
      urlPath = "/index.html";
    }

    const filePath = path.normalize(path.join(root, urlPath));
    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "Content-Type": types[path.extname(filePath)] || "application/octet-stream"
      });
      response.end(data);
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`Garage preview running at http://localhost:${port}`);
  });
