var chalk = require('chalk');
const log = console.log

var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var mainPort = 10000;
var funs = [];

var root = '';
var directory = 'services';


function serv () {

    arguments = process.argv;
    arguments.forEach((arg, index) => {
        if(arg === '-d') {
            directory = arguments[index + 1] || directory;
        }
    });

    root = path.resolve(process.env.INIT_CWD, directory);


    var rootExists = fs.existsSync(root);

    if(!rootExists) {
        log(chalk.redBright('目录' + directory + '不存在！'));
        return;
    }

    fs.readdir(root, function(err, servdirs) {
        if(err) return;

        servdirs.forEach(function(servdir) {
            var servicePath = path.resolve(root, servdir);
            fs.stat(servicePath, function(servErr, servStat) {
                if (servStat && servStat.isDirectory()) {
                    fs.readdir(servicePath, function (funErr, fundirs) {
                        if(funErr) return;

                        fundirs.forEach(function (fundir) {
                            var funPath = path.resolve(servicePath, fundir);
                            fs.stat(funPath, function (funStatErr, funStat) {
                                if(funStat && funStat.isDirectory()) {
                                    funs.push({
                                        service: servdir,
                                        function: fundir,
                                        entry: path.resolve(funPath, 'main')
                                    });                             
                                }
                            });
                        });
                    });
                }
            });
        });
    });


    http.createServer(function(req, res) {
        var pathName = url.parse(req.url).pathname;
        var localPath = "";
        var ext = path.extname(pathName);
        var Type = req.method;

            log('waht');
            log(Type);
        if (Type == 'POST') {
            log('POST');
            var resData = {};
            var body = '';
            req.on('data', function(data) {
                body += data;
            });

            var contentType = req.headers['content-type'];

            req.on('end', function(data) {

                log('contentType:');
                log(contentType);
                if (contentType.indexOf('application/json') > -1) {
                    resData = JSON.parse(body);
                } else {
                    var len = body.split('&').length;
                    if (len > 0) {
                        for (var i = 0; i < len; i++) {
                            var key = body.split('&')[i];
                            resData[key.split('=')[0]] = key.split('=')[1];
                        }
                    }
                }

                var fcData = {
                    FC_SCHOOL_CODE: '10030',
                    FC_USER_ID: '20170102',
                    FC_USER_NAME: '黄加仪',
                    origin: resData
                }

                var paths = pathName.split('/');
                if(paths.length < 7) {
                    res.end(JSON.stringify({code: 999, message: '路径不对，请确认'}));
                }

                var service = paths[3];
                var func = paths[5];
                
                invokeFun(service, func, fcData, res);

            });

        } else if (Type == 'GET') {
            res.end('server is running');
        } else if (Type == 'OPTIONS') {
            res.writeHead(200, {
                'Access-Control-Request-Method': 'POST', 
                'Access-Control-Allow-Origin': 'http://172.20.6.75:9999',
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'application/octet-stream'
            });
            res.end();
        }
    }).listen(mainPort);

    console.log('server is running: http://127.0.0.1:' + mainPort);
}

function invokeFun(service, fun, data, res) {
    // console.log('all services:');
    // console.log(funs);
    console.log('[' + service + '/' + fun + '] will be invoked:');
    var t_funs = funs.filter(function (f) {
        return f.service.toLowerCase() == service.toLowerCase() && f.function.toLowerCase() == fun.toLowerCase();
    });
    if(t_funs.length < 1) {
        res.end(JSON.stringify({code: 999, message: '服务或方法不存在'}));
    } else {
        
        var func = require(t_funs[0].entry);

        func.handler(JSON.stringify(data), {}, function(error, data) {
            var now = new Date();
            var rtn = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
            if (error) {
                rtn += '【error】:';
            } else {
                rtn += '【info】:';
            }
            rtn += '函数 [' + service + '/' + fun + '] 执行结果：';
            log(rtn);
            log(error || data);
            res.writeHead(200, {
                'Access-Control-Request-Method': 'POST', 
                'Access-Control-Allow-Origin': 'http://172.20.6.75:9999',
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'application/json;charset=utf-8'
            });
            res.end(error || data);
        });
    }
}


exports.serv = serv;