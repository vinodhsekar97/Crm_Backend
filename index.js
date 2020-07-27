const express = require("express");

const cors = require("cors");

const mongoClient = require("mongodb");

const bcrypt = require("bcrypt");

const bodyParser = require("body-parser");

const jwt = require("jsonwebtoken");

const url = "mongodb+srv://dbUser:dbUser@cluster0-1n5gp.mongodb.net/<dbname>?retryWrites=true&w=majority";

const app = express();

const saltRound = 10;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post("/user/signup", (req, res) => {
    console.log(req.body);

    const user = {
        email : req.body.email,
        password: req.body.password,
        fullname: req.body.fullname,
        type: req.body.type,
        phoneno: req.body.phoneno
    }
    bcrypt.genSalt(saltRound, (err, salt) => {
        if(err) throw err;
        console.log(salt);
        bcrypt.hash(req.body.password, salt, (err, hash) => {
            if(err) throw err;
            console.log(hash);
            user.password = hash;
            mongoClient.connect(url, (err, client) => {
                if(err) throw err;
                let db = client.db("crm");
                db.collection('users').insertOne(user, (err, data) => {
                    if(err) throw err;
                    client.close();
                    res.json({
                        message: "success",
                        data : data
                    })
                })
            })
        }) 
    })
    
})

app.post("/users/login", (req, res) => {
    console.log(req.body);
    mongoClient.connect(url, (err, client) => {
        if(err) throw err;
        let db = client.db("crm");
        db.collection("users").findOne({'email': req.body.email}, (err, data) => {
            if(err) throw err;
            console.log(data);
            client.close();
            bcrypt.compare(req.body.password, data.password, function(err, result) {
                if(err) throw err;
                if(result){
                    let token = jwt.sign({email: req.body.email}, "Abcsdfsdfdsfds");
                    res.json({
                        message: "logged in !",
                        token: token
                    })
                }
                
            });
        })
    })

})

app.listen(3000, () => {
    console.log("port running at 3000");
})