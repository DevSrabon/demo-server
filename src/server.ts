import app from "./app";
const bootstrap = async () => {
  app.listen(5000, () => console.log("Listening on ports 5000"));
};

bootstrap();
