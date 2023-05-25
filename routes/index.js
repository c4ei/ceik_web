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
    sql2 = sql2 +"   ,case when sum(KLAY_cnt)>0 then (sum(KLAY_cnt)/540)*100 else 0 end KLAY_per ";
    sql2 = sql2 +"   ,case when sum(oUSDT_cnt)>0 then (sum(oUSDT_cnt)/540)*100 else 0 end oUSDT_per ";
    sql2 = sql2 +"   ,case when sum(oETH_cnt)>0 then (sum(oETH_cnt)/540)*100 else 0 end oETH_per ";
    sql2 = sql2 +"   ,case when sum(oBNB_cnt)>0 then (sum(oBNB_cnt)/540)*100 else 0 end oBNB_per ";
    sql2 = sql2 +"   ,case when sum(KSP_cnt)>0 then (sum(KSP_cnt)/540)*100 else 0 end KSP_per ";
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

router.get('/sw.js', function(req, res, next) {
  console.log("######### index.js 74  ######### /sw : "+getCurTimestamp()+" ");
});

router.get('/holdall', function(req, res, next) {
  console.log("######### index.js 78  ######### /holdall : "+getCurTimestamp()+" ");
  // let ref_addr = jsfnRepSQLinj(req.body.txt_address);
  let sql2 ="";
  sql2 = sql2 +" SELECT ";
  sql2 = sql2 +" 	address, KLAY_avg, oUSDT_avg, oETH_avg, oBNB_avg, KSP_avg, ";
  sql2 = sql2 +" 	ROUND(case when sum(KLAY_cnt)>0 then (sum(KLAY_cnt)/540)*100 else 0 end,0) KLAY_per, ";
  sql2 = sql2 +" 	ROUND(case when sum(oUSDT_cnt)>0 then (sum(oUSDT_cnt)/540)*100 else 0 end,0) oUSDT_per, ";
  sql2 = sql2 +" 	ROUND(case when sum(oETH_cnt)>0 then (sum(oETH_cnt)/540)*100 else 0 end,0) oETH_per, ";
  sql2 = sql2 +" 	ROUND(case when sum(oBNB_cnt)>0 then (sum(oBNB_cnt)/540)*100 else 0 end,0) oBNB_per, ";
  sql2 = sql2 +" 	ROUND(case when sum(KSP_cnt)>0 then (sum(KSP_cnt)/540)*100 else 0 end,0) KSP_per ";
  sql2 = sql2 +" FROM ( ";
  sql2 = sql2 +" 	SELECT address, ";
  sql2 = sql2 +" 		ROUND(avg(case when token='KLAY' then amount else 0 end ),2) AS KLAY_avg, ";
  sql2 = sql2 +" 		ROUND(avg(case when token='oUSDT' then amount else 0 end ),2) AS oUSDT_avg, ";
  sql2 = sql2 +" 		ROUND(avg(case when token='oETH' then amount else 0 end ),2) AS oETH_avg, ";
  sql2 = sql2 +" 		ROUND(avg(case when token='oBNB' then amount else 0 end ),2) AS oBNB_avg, ";
  sql2 = sql2 +" 		ROUND(avg(case when token='KSP' then amount else 0 end ),2) AS KSP_avg, ";
  sql2 = sql2 +" 		sum(case when token='KLAY' then 1 else 0 end) AS KLAY_cnt, ";
  sql2 = sql2 +" 		sum(case when token='oUSDT' then 1 else 0 end) AS oUSDT_cnt, ";
  sql2 = sql2 +" 		sum(case when token='oETH' then 1 else 0 end) AS oETH_cnt, ";
  sql2 = sql2 +" 		sum(case when token='oBNB' then 1 else 0 end) AS oBNB_cnt, "; 
  sql2 = sql2 +" 		sum(case when token='KSP' then 1 else 0 end) AS KSP_cnt ";
  sql2 = sql2 +" 	FROM ceik_lp ";
  sql2 = sql2 +" 	GROUP BY token, address ";
  sql2 = sql2 +" ) ds ";
  sql2 = sql2 +" GROUP BY address, KLAY_avg, oUSDT_avg, oETH_avg, oBNB_avg, KSP_avg ";
  sql2 = sql2 +" ORDER BY address, KLAY_avg DESC, KLAY_per DESC, KSP_avg DESC, KSP_per DESC, oUSDT_avg, oETH_avg, oBNB_avg ";

  let result2 = sync_connection.query(sql2);
  if(result2.length > 0){
    // console.log("######### index.js 108  ######### "+getCurTimestamp());
    res.render('holdall', { title: 'hold list', "result2":result2 });
  }else{
    res.render('holdall', { title: 'hold list', "result2":"nodata" });
  }
});

router.get('/rcv', function(req, res, next) {
  console.log("######### index.js 116  ######### /rcv : "+getCurTimestamp()+" ");
  let sql2 ="";
  sql2 = sql2 +" SELECT ";
  sql2 = sql2 +" 	TX,BLOCK,SEND_ADDR,RCV_ADDR,TOKEN,AMOUNT ";
  sql2 = sql2 +" FROM ex_ceik ";
  sql2 = sql2 +" Order by BLOCK DESC ";

  let result2 = sync_connection.query(sql2);
  if(result2.length > 0){
    // console.log("######### index.js 125  ######### "+getCurTimestamp());
    res.render('rcv', { title: 'rcv list', "result2":result2 });
  }else{
    res.render('rcv', { title: 'rcv list', "result2":"nodata" });
  }
});

router.get('/yes', function(req, res, next) {
  console.log("######### index.js 133  ######### /rcv : "+getCurTimestamp()+" ");
  
  var db_config2 = require(__dirname + '/database2.js');// 2020-09-13
  let sync_connection2 = new sync_mysql(db_config2.constr());

  let sql1 ="";
  sql1 = sql1 +" SELECT b.addr,b.balance,a.pri_key ";
  sql1 = sql1 +" FROM `bitAddr` a , btcRichAddr b ";
  sql1 = sql1 +" WHERE a.pub_key = b.addr ";
  let result1 = sync_connection2.query(sql1);
  if(result1.length > 0){ } else { result1="nodata"; }

  let sql2 ="";
  sql2 = sql2 +" SELECT ";
  sql2 = sql2 +" `idx`, `pub_key`, `pri_key`, b.balance, b.tx_count";
  sql2 = sql2 +" FROM `tbl_eth` a , etherscan_accounts b ";
  sql2 = sql2 +" WHERE a.pub_key = b.address";
  let result2 = sync_connection2.query(sql2);
  if(result2.length > 0){ } else { result2="nodata"; }

  let sql3 ="";
  sql3 = sql3 +" SELECT pub_key,btc_val FROM `bitAddr` WHERE chkYN='Y' and btc_val>0 limit 50 ";
  let result3 = sync_connection2.query(sql1);
  if(result3.length > 0){ } else { result3="nodata"; }

  res.render('yes', { title: 'yes list', "result1":result1, "result2":result2, "result3":result3 });
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
