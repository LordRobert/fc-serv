#!/usr/bin/env node
'use strict';

process.env.INIT_CWD = process.cwd();

var lib= require('../fc-serv.js');
lib.serv();