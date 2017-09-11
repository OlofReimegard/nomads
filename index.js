const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require("body-parser");
const sqlFun = require("./sqlFun.js");
const passFun = require("./passFun.js");
const cookieSession = require('cookie-session');
const cookieParser = require("cookie-parser");
const multer = require('multer');
const uidSafe = require('uid-safe');
const secrets = require('./secrets.json');
const path = require('path');
const fs = require('fs');
const myUrl = require('./config.json');
const spicedPg = require('spiced-pg');
const db = spicedPg(process.env.DATABASE_URL || 'postgres:postgres:password@localhost:5432/signatures');

const diskStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, __dirname + "/uploads");
    },
    filename: (req, file, callback) => {
        uidSafe(24).then((uid) => {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 20097152
    }
});

const knox = require('knox');
const client = knox.createClient({key: secrets.AWS_KEY, secret: secrets.AWS_SECRET, bucket: 'olofsbuckett'});

app.use(cookieSession({
    secret: 'I like grapes',
    maxAge: 1000 * 60 * 60 * 24 * 14
}));

if (process.env.NODE_ENV != 'production') {
    app.use(require('./build'));
}
app.use(cookieParser());
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));

app.post('/register-user', function(req, res) {
    console.log("this works");
    passFun.hashPassword(req.body.password).then((result) => {
        console.log("this works too");
        sqlFun.insertUser(req.body, result).then((result) => {
            console.log("this works three");
            req.session.user = {
                user: true,
                email: req.body.email,
                first: req.body.first,
                last: req.body.last,
                id: result
            };
            res.redirect("/profile");

        });
    });
});

app.post('/login-user', function(req, res) {
    sqlFun.readUser().then((rows) => {
        rows.forEach((item) => {
            if (item.email == req.body.email) {
                passFun.checkPassword(req.body.password, item.password).then((result) => {
                    if (result) {
                        req.session.user = {
                            user: true,
                            email: item.email,
                            first: item.first,
                            last: item.last,
                            id: item.id
                        };
                        res.redirect("/");
                    } else {
                        res.json({success: false});
                    }
                });
            }
        });
    });
});

app.get('/user', function(req, res) {
    sqlFun.getUser(req.session.user.id).then((row) => {
        res.json(row);
    });
});

app.post('/user-info', function(req, res) {
    db.query("SELECT  * FROM social_users WHERE id = " + req.body.userId + "").then((data) => {
        res.json(data.rows);
    });
});

app.post('/add-wall-post', function(req, res) {
    db.query("INSERT INTO wall_posts (rec_id,req_id, message) VALUES ($1,$2,$3)",[req.body.recId,req.session.user.id,req.body.message]).then(() => {
        res.json({success:true});
    });
});

app.post('/get-wall-posts', function(req, res) {
    console.log(req.body);
    db.query("SELECT wall_posts.message,wall_posts.rec_id,wall_posts.req_id, social_users.first, social_users.last, social_users.url FROM wall_posts INNER JOIN social_users ON wall_posts.req_id = social_users.id AND rec_id=$1 ORDER BY wall_posts.id DESC",[req.body.recId]).then((result) => {
        console.log(result.rows);
        res.json({wallPosts:result.rows});
    });
});

app.get('/get-user-wall-posts', function(req, res) {

    db.query("SELECT wall_posts.message,wall_posts.rec_id,wall_posts.req_id, social_users.first, social_users.last, social_users.url FROM wall_posts INNER JOIN social_users ON wall_posts.req_id = social_users.id AND rec_id=$1 ORDER BY wall_posts.id DESC",[req.session.user.id]).then((result) => {
        console.log(result.rows);
        res.json({wallPosts:result.rows});
    });
});

app.post('/online-users', function(req, res) {

    const finalUsers = [];
    req.body.finalUsers.forEach((user) => {
        if (user != req.session.user.id) {
            finalUsers.push(user);
        }
    });

    db.query("SELECT  * FROM social_users WHERE id = ANY(ARRAY [" + finalUsers + "])").then((data) => {
        console.log(data.rows);
        res.json(data.rows);
    });
});

app.get('/user-profiles/:id', function(req, res) {
    if (req.params.id == req.session.user.id) {
        res.json({redirect: ("/")});
    } else {
        sqlFun.getUser(req.params.id).then((row) => {
            res.json(row);
        });
    }
});

app.post('/insert-bio', function(req, res) {
    sqlFun.insertBio(req.body.bio, req.session.user.id).then((biog) => {
        res.json({bio: biog});
    }).catch((err) => {
        console.log(err);
    });
});

app.post('/friend-requests', function(req, res) {
    sqlFun.getRequest(req.body.recId, req.session.user.id).then((reqStatus) => {
        if (reqStatus.length == 0) {
            res.json({response: 0});
        } else {
            res.json({response: reqStatus[0].status, recipient: reqStatus[0].rec_id});
        }
    }).catch((err) => {
        console.log(err);
    });
});

app.get('/friends-page-requests', function(req, res) {
    let tempObj = {};
    sqlFun.getUserFriends(req.session.user.id).then((friendsArr) => {
        tempObj.friends = friendsArr;
        sqlFun.getUserRequests(req.session.user.id).then((requestsArr) => {
            tempObj.requests = requestsArr;
            let responseObj = {
                friends: [],
                requests: []
            };
            sqlFun.readUser().then((allUsers) => {
                tempObj.friends.forEach((item) => {
                    allUsers.forEach((user) => {
                        if (user.id == item.req_id) {
                            if (item.req_id != req.session.user.id) {
                                responseObj.friends.push(user);
                            }
                        } else if (user.id == item.rec_id && item.req_id == req.session.user.id) {
                            responseObj.friends.push(user);
                        }
                    });

                });
                tempObj.requests.forEach((item) => {
                    allUsers.forEach((user) => {
                        if (user.id == item.req_id) {
                            responseObj.requests.push(user);
                        }
                    });
                });
                res.json(responseObj);
            });

        });
    });
});

app.post('/request', function(req, res) {
    sqlFun.getRequest(req.body.recId, req.session.user.id).then((reqStatus) => {

        if (reqStatus.length == 0) {
            sqlFun.request(req.body.recId, req.session.user.id, req.body.status).then((row) => {
                res.json({status: 2});
            }).catch((err) => {
                console.log(err);
            });
        } else {

            sqlFun.updateRequest(req.body.recId, req.session.user.id, req.body.status).then((row) => {
                res.json({id: row.id, status: req.body.status});
            }).catch((err) => {
                console.log(err);
            });
        }
    }).catch((err) => {
        console.log(err);
    });
});

app.post('/upload', uploader.single('file'), (req, res) => {
    const s3Request = client.put(req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });

    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    s3Request.on('response', (s3Response) => {
        if (s3Response.statusCode == 200) {
            sqlFun.insertImage(req.file.filename, req.session.user.id).then((url) => {
                res.json({
                    url: myUrl.s3Url + url
                });
            }).catch((err) => {
                console.log(err);
                res.json({
                    url: myUrl.s3Url + url
                });
            });
        }
    });

});

app.get('/logout', function(req, res) {
    req.session = null;
    res.redirect('/welcome');

});

app.get('/welcome', function(req, res) {
    if (req.session.user) {
        res.redirect("/profile");
    } else {
        res.sendFile(__dirname + '/index.html');
    }
});

app.get('*', function(req, res) {
    if (!req.session.user) {
        res.redirect("/welcome");
    } else {
        res.sendFile(__dirname + '/index.html');
    }
});

/*//////SOCKET.IO/////*/

let userArr = [];
let messageArr = [];

io.on('connection', function(socket) {

    socket.emit('welcome', {message: 'Welome. It is nice to see you'});

    socket.emit('sendId', {
        onlineUsers: userArr,
        onlineMessages: messageArr
    });

    socket.on('thanks', (data) => {
        console.log(data.message);

    });

    socket.on('newMessage', () => {
        io.sockets.emit("newMessage", {onlineMessages: messageArr});

    });

    socket.on('msg', (data) => {

        io.sockets.emit("msg", {onlineMessages: messageArr});

    });

    socket.on('addUser', (data) => {

        io.sockets.emit('newUser', {
            userId: data.id,
            onlineMessages: messageArr
        });

    });

    socket.on('disconnect', function() {

        let leavingId = userArr.filter((user) => {
            console.log(user.socketId == socket.id);
            return user.socketId == socket.id;
        })[0];

        if (!userArr.find((user) => {
            return user.userId == leavingId && leavingId.userId;
        })) {
            io.sockets.emit("leavingUser", {
                userId: leavingId && leavingId.userId
            });
        }

        userArr = userArr.filter((obj) => {
            return obj.socketId != socket.id;
        });


    });
});

app.post('/add-user', function(req, res) {

    if (req.session.user) {
        const user = {
            socketId: req.body.socketId,
            userId: req.session.user.id
        };
        function compareId(obj) {
            return obj.socketId == req.body.socketId;
        }

        if (typeof userArr.find(compareId) == "undefined") {

            userArr.push(user);
        }
        res.json({onlineUsers: [userArr], yourId: req.session.user.id, socketId: user.socketId});
    }

});

app.post('/user-search', function(req, res) {
    let search = req.body.userSearch[0].toUpperCase() + req.body.userSearch.slice(1);
    console.log(search);
    db.query("SELECT  * FROM social_users WHERE first LIKE '" + search + "%'").then((data) => {
        console.log(data.rows);
        res.json(data.rows);
    });

});

app.post('/add-message', function(req, res) {

    const messageObj = {
        message: req.body.message,
        name: req.body.name,
        imgUrl: req.body.imgUrl
    };
    if(messageArr.length < 10){
        messageArr.push(messageObj);
    } else {
        messageArr.shift();
        messageArr.push(messageObj);
    }

    res.json({success: true});

});

/*//////SOCKET.IO/////*/

server.listen(8080, function() {
    console.log("I'm listening.");
});
