// https://scope.klaytn.com/account/0x000000000000000000000000000000000000dead?tabId=txList burning address
var express = require('express');
var router = express.Router();
var path = require('path');
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended : true}));

// var cookieParser = require('cookie-parser');
const STATIC_PATH = path.join(__dirname, '../public')
// add web3 2021-11-08
//npm install web3

// npm i sync-mysql
var db_config = require(__dirname + '/database.js');// 2020-09-13
var sync_mysql = require('sync-mysql'); //2020-01-28
let sync_connection = new sync_mysql(db_config.constr());
////////////////////////

/////////////////////////

router.get('/', function(req, res, next) {
  if (req.params.txt_address == "" || req.params.txt_address === undefined ) {
    res.sendFile(STATIC_PATH + '/main.html')
    return;
  }
});

router.post('/holdlist', function(req, res, next) {
  console.log("######### index.js 27  ######### /holdlist/:txt_address : "+getCurTimestamp()+" ");
  if (req.body.txt_address == "" || req.body.txt_address === undefined ) {
    res.sendFile(STATIC_PATH + '/main.html')
    return;
  }
  else {
    let ref_addr = jsfnRepSQLinj(req.body.txt_address);
    let sql ="";
    sql = sql +" SELECT address, token ,count(idx) cnt, DATE(regdate) yyyymmdd FROM ceik_lp "; 
    sql = sql +" WHERE address='"+ref_addr+"' ";
    sql = sql +" GROUP BY address, token ,DATE(regdate) ";
    sql = sql +" ORDER BY DATE(regdate) DESC ";
    console.log("######### index.js 31  ######### "+getCurTimestamp()+" sql: "+sql);
    let result = sync_connection.query(sql);
    if(result.length > 0){
      console.log("######### index.js 228  ######### "+getCurTimestamp()+" result: "+result[0].address);
      res.render('holdlist', { title: 'hold list', "result":result, "addr":ref_addr });
    }else{
      res.render('holdlist', { title: 'hold list', "result":"nodata", "addr":ref_addr });
    }
  }
});

function jsfnRepSQLinj(str){
  str = str.replace('\'','`');
  str = str.replace('--','');
  return str;
}

const minABI = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
];


function getCurTimestamp() {
  const d = new Date();

  return new Date(
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds()
    )
  // `toIsoString` returns something like "2017-08-22T08:32:32.847Z"
  // and we want the first part ("2017-08-22")
  ).toISOString().replace('T','_').replace('Z','');
}

module.exports = router;
