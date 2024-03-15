import dotenv from "dotenv";
import connectDB from "./db/db.js";
import app from "./app.js";
dotenv.config();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB failed to connect", err);
  });

/*













const app = express();
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);

    app.on("error", (error) => {
      console.log("SERVER ERROR: ", error);
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server is listening on Port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("DB ERROR: ", error);
    throw err;
  }
})();

*/
