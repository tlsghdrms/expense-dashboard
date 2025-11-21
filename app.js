const express = require("express");
const dbConnect = require("./config/dbConnect");
const path = require("path");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;

dbConnect();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// 미들웨어 등록
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser());

// 라우터 등록
app.use("/users", require("./routes/userRoutes"));
app.use("/expenses", require("./routes/expenseRoutes"));

app.listen(port, () => {
    console.log(`${port}번 포트에서 서버 실행 중`);
});