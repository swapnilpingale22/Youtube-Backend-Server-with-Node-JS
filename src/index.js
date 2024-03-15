import dotenv from "dotenv";
import connectDB from "./db/db.js";
dotenv.config();

connectDB();










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
