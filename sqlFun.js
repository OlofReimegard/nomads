const spicedPg = require('spiced-pg');
const db = spicedPg(process.env.DATABASE_URL || 'postgres:postgres:password@localhost:5432/signatures');




// ***************** USERS *********************

exports.onlineUsers = (ids) => {
    console.log("logging from sqlful","SELECT  * FROM social_users WHERE id = ANY(ARRAY ["+ids+"])");
    return new Promise((resolve, reject) => {
        var query = "SELECT  * FROM social_users WHERE id = ANY(ARRAY "+ids+")";

        db.query(query).then((users) => {
            resolve(users.rows);
        }).catch((err) => {
            reject(err);
        });
    });
};

exports.insertUser = (data, pswrd) => {
    return new Promise((resolve, reject) => {
        var query = "INSERT INTO social_users (first, last, email, password, url) VALUES ($1,$2,$3,$4,$5) RETURNING id";

        db.query(query, [data.first, data.last, data.email, pswrd,"placeholder.png"]).then((id) => {
            resolve(id.rows[0].id);
        }).catch((err) => {
            reject(err);
        });
    });
};

exports.readUser = () => {
    return new Promise((resolve, reject) => {
        var query = "SELECT * FROM social_users;";

        db.query(query).then((data) => {
            resolve(data.rows);
        }).catch((err) => {
            reject(err);
        });
    });
};

exports.getUser = (id) => {
    return new Promise((resolve, reject) => {
        var query = "SELECT * FROM social_users WHERE id=$1;";

        db.query(query,[id]).then((data) => {
            resolve(data.rows);
        }).catch((err) => {
            reject(err);
        });
    });
};

exports.updateUser = (id, data, password) => {
    return new Promise((resolve, reject) => {
        var query = "UPDATE users SET first = $2, last = $3, email = $4, password = $5 WHERE id = $1;";

        db.query(query, [id, data.first, data.last, data.email, password]).then(() => {
            resolve(password);
        }).catch((err) => {
            reject(err);
        });
    });
};

exports.insertImage = (url,id) => {
    return new Promise((resolve, reject) => {
        var query = "UPDATE social_users SET url=$1 WHERE id=$2";

        db.query(query, [url,id]).then(() => {
            resolve(url);
        }).catch((err) => {
            reject(err);
        });
    });
};

exports.insertBio = (bio,id) => {
    return new Promise((resolve, reject) => {
        var query = "UPDATE social_users SET bio=$1 WHERE id=$2";

        db.query(query, [bio,id]).then(() => {
            resolve(bio);
        }).catch((err) => {
            reject(err);
        });
    });
};


exports.getUserFriends = (userId) => {
    return new Promise((resolve, reject) => {
        var query = "SELECT * FROM friend_requests WHERE (req_id=$1 OR rec_id=$1) AND (status = 1);";

        db.query(query, [userId]).then((result) => {
            resolve(result.rows);
        }).catch((err) => {
            reject(err);
        });
    });
};

exports.getUserRequests = (userId) => {
    return new Promise((resolve, reject) => {
        var query = "SELECT * FROM friend_requests WHERE (rec_id=$1) AND (status = 2);";

        db.query(query, [userId]).then((result) => {
            resolve(result.rows);
        }).catch((err) => {
            reject(err);
        });
    });
};


exports.getRequest = (recId,reqId) => {
    return new Promise((resolve, reject) => {
        var query = "SELECT * FROM friend_requests WHERE (req_id=$1 OR rec_id=$1) AND (req_id=$2 OR rec_id=$2);";

        db.query(query, [reqId,recId]).then((result) => {
            resolve(result.rows);
        }).catch((err) => {
            reject(err);
        });
    });
};


exports.request = (recId,reqID,status) => {
    return new Promise((resolve, reject) => {
        var query = "INSERT INTO friend_requests (rec_id, req_id, status) VALUES ($1,$2,$3)";

        db.query(query, [recId,reqID,status]).then((result) => {
            resolve(result.rows);
        }).catch((err) => {
            reject(err);
        });
    });
};

exports.updateRequest = (recId,reqId,status) => {
    console.log("this is the status from withing updateRequest" + status,recId,reqId);
    return new Promise((resolve, reject) => {
        var query = "UPDATE friend_requests SET status = $3 WHERE (rec_id = $1 AND req_id = $2) OR (rec_id = $2 AND req_id = $1)";

        db.query(query, [recId,reqId,status]).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
    });
};
