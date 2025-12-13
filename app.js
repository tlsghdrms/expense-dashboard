const express = require("express");
const dbConnect = require("./config/dbConnect");
const path = require("path");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const { checkUser } = require("./middlewares/authMiddleware")

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

// checkUser 미들웨어 하나로 대체
app.get("/", checkUser, (req, res) => {
    res.render("index");
});

// 라우터 등록
app.use("/users", require("./routes/userRoutes"));
app.use("/expenses", require("./routes/expenseRoutes"));

// 없는 페이지(404) 관리
app.use((req, res, next) => {
    res.status(404).send(`
        <script>
            alert("페이지를 찾을 수 없습니다.");
            location.href = "/";
        </script>    
    `);
});

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);
    res.send(`
        <script>
            alert("${err.message}"); 
            history.back();
        </script>
    `);
});

app.listen(port, () => {
    console.log(`${port}번 포트에서 서버 실행 중`);
});