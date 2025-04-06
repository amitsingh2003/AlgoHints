import "dotenv/config";
import app from "./src/app.js";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

function gracefulShutdown() {
  console.log("Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
}

const server = app.listen(PORT, HOST, () => {
  console.log(`
    🚀 Server started successfully!
    
    📡 Environment: ${process.env.NODE_ENV || "development"}
    🌐 URL: http://${HOST}:${PORT}
    ⏱️  Time: ${new Date().toLocaleString()}
    `);
});

export default server;
