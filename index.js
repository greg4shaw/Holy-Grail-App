var express = require('express');
var app = express();
var redis = require("redis");
var client = redis.createClient();

// init values
client.mset('header',0,'left',0,'article',0,'right',0,'footer',0);
client.mget(['header','left','article','right','footer'],
    function(err, value) {
        console.log(value)
});

// method to package the response from the db server in a nice JSON object that matches what we are receiving on the front end
// this is so we can add it to the front end through setData
// using a promise as we are calling a DB

function data(){
    return new Promise((resolve, reject) => {
        client.mget(['header','left','article','right','footer'],
            function(err, value){
                const data ={
                    'header': Number(value[0]),
                    'left': Number(value[1]),
                    'article': Number(value[2]),
                    'right': Number(value[3]),
                    'footer': Number(value[4]),
                };
                err ? reject(null) : resolve(data);
            }
        );
    })
}

//serve static files from public directory
app.use(express.static('public'));

// get data
app.get('/data', function (req, res) {
    data()
        .then(data => {
            console.log(data);
            res.send(data);
        });
});

// update data
app.get('/update/:key/:value', function (req, res) {
    const key = req.params.key;
    let value = Number(req.params.value);
    client.get(key, function(err, reply){

        //new value
        value = Number(reply) + value;
        client.set(key, value);

        // return data to client in a nice package
        data()
            .then(data => {
                console.log(data);
                res.send(data);
            });
    });
});

app.listen(3000, function(){
    console.log('Running on port: 3000')
})