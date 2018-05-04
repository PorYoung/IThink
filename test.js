let request = require('request')
let express = require('express')
let app = express();
let http = require('http')
let fs = require('fs')
let bodyParser = require('body-parser')
let server = http.createServer(app)
server.listen(3000);

let requestAsync = function(url){
    return new Promise(function(resolve,reject){
        request({url:url},function(error,response,body){
            if (error) return reject(error)
            resolve({response,body})
        })
    })
}

const requestPostAsync = function(url,form){
    return new Promise(function(resolve,reject){
        request.post({url,form:form},function(error,response,body){
            if (error) return reject(error)
            resolve({response,body})
        })
    })
}

app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(bodyParser.json())
app.post('/post',async (req,res)=>{
    console.log(req.body);
    let result = await requestAsync('https://www.baidu.com');
    res.send(result.body);
})