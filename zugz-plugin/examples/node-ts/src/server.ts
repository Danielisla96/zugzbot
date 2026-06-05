import { createServer } from "node:http";

const server = createServer((req, res) => {
  if (req.url === "/api/ping") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "pong" }));
    return;
  }
  res.writeHead(404);
  res.end("Not found");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Demo server running on http://localhost:${PORT}`);
});
