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
    sql = sql +" SELECT address, token , DATE(regdate) yyyymmdd ,`rank`, percent, totSupply FROM ceik_lp  "; 
    sql = sql +" WHERE address='"+ref_addr+"' ";
    sql = sql +" ORDER BY regdate desc , token ASC ";
    console.log("######### index.js 41  ######### "+getCurTimestamp()+" sql: "+sql);
    let result = sync_connection.query(sql);

    let sql2 ="";
    sql2 = sql2 +" SELECT ";
    sql2 = sql2 +"   sum(KLAY_cnt) KLAY_cnt, sum(oUSDT_cnt) oUSDT_cnt, sum(oETH_cnt) oETH_cnt, sum(oBNB_cnt) oBNB_cnt, sum(KSP_cnt) KSP_cnt ";
    sql2 = sql2 +"   ,case when sum(KLAY_cnt)>0 then (sum(KLAY_cnt)/180)*100 else 0 end KLAY_per ";
    sql2 = sql2 +"   ,case when sum(oUSDT_cnt)>0 then (sum(oUSDT_cnt)/180)*100 else 0 end oUSDT_per ";
    sql2 = sql2 +"   ,case when sum(oETH_cnt)>0 then (sum(oETH_cnt)/180)*100 else 0 end oETH_per ";
    sql2 = sql2 +"   ,case when sum(oBNB_cnt)>0 then (sum(oBNB_cnt)/180)*100 else 0 end oBNB_per ";
    sql2 = sql2 +"   ,case when sum(KSP_cnt)>0 then (sum(KSP_cnt)/180)*100 else 0 end KSP_per ";
    sql2 = sql2 +" FROM ( ";
    sql2 = sql2 +"     SELECT ";  
    sql2 = sql2 +"     sum(case when token='KLAY' then 1 else 0 end) AS KLAY_cnt, ";
    sql2 = sql2 +"     sum(case when token='oUSDT' then 1 else 0 end) AS oUSDT_cnt, ";
    sql2 = sql2 +"     sum(case when token='oETH' then 1 else 0 end) AS oETH_cnt, ";
    sql2 = sql2 +"     sum(case when token='oBNB' then 1 else 0 end) AS oBNB_cnt, ";
    sql2 = sql2 +"     sum(case when token='KSP' then 1 else 0 end) AS KSP_cnt ";
    sql2 = sql2 +"     FROM ceik_lp   ";
    sql2 = sql2 +"     WHERE address='"+ref_addr+"' ";
    sql2 = sql2 +"     GROUP BY token  ";
    sql2 = sql2 +" ) ds     ";
    let result2 = sync_connection.query(sql2);
    if(result.length > 0){
      console.log("######### index.js 60  ######### "+getCurTimestamp()+" result: "+result[0].address);
      res.render('holdlist', { title: 'hold list', "result":result, "result2":result2, "addr":ref_addr });
    }else{
      res.render('holdlist', { title: 'hold list', "result":"nodata","result2":"nodata", "addr":ref_addr });
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
