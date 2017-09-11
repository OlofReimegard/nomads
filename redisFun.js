
var client = require('redis').createClient(process.env.REDIS_URL);
client.on('error', function(err) {
    console.log(err);
});


exports.checkSignFromDb = (promise) => {
    return new Promise ((resolve, reject) => {
        client.get('signatures', function(err, data) {
            if (err) {
                reject(err);
            }
            if (data === null) {
                promise.then((signArr) => {
                    client.setex("signatures", 60*5, JSON.stringify(signArr));
                    resolve("added");
                });
            } else {
                resolve("there");
            }
        });
    });
};

exports.getSignFromDb = () => {
    return new Promise ((resolve, reject) => {
        client.get('signatures', function(err, data) {
            if(err){
                reject(err);
            }
            resolve(JSON.parse(data));
        });
    });
};

exports.getSignFromDbArea = (area) => {
    return new Promise ((resolve, reject) => {
        client.get('signatures', function(err, data) {
            if(err){
                reject(err);
            }
            let sortedData = JSON.parse(data);
            sortedData = sortedData.filter((item) => {
                return item.city == area;
            });
            resolve(sortedData);
        });
    });
};

exports.clearDb = () => {
    return new Promise ((resolve, reject) => {
        console.log("deleted");
        client.del('signatures', function(err) {
            if(err){
                reject(err);
            }
            resolve("cleared");
        });
    });
};
