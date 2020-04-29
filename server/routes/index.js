const questiontroutes = require("./question")
const commentsRouter = require("./comments")
const tagsroutes = require("./tags")


const constructorMethod = app => {
    app.use("/questions", questiontroutes);
    app.use("/questions", commentsRouter); // adds comments routes to question
    app.use("/tags", tagsroutes);
    app.use("*", (req, res) => {
        res.status(404).json({
            error: "Not Found"
        });
    })
}

module.exports = constructorMethod;
