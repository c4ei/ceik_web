// https://scope.klaytn.com/account/0x000000000000000000000000000000000000dead?tabId=txList burning address
var express = require('express');
var router = express.Router();
var path = require('path');

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
  if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined ) {
    // res.sendFile(STATIC_PATH + '/ulogin.html')
    res.sendFile(STATIC_PATH + '/main.html')
    return;
  }
  else {
    /////////////////////////
    console.log("///////////////////////// 27  /////////////////////////");
    /////////////////////////
      res.render('index', { title: 'easypay' });
  }
});

router.get('/getLotto/:id', function(req, res, next) {
  // if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
  //   res.sendFile(STATIC_PATH + '/ulogin.html')
  //   return;
  // }
  // else {
    let result = sync_connection.query("SELECT yyyy,wk,regdate,chips,sendTr,numb_tot FROM lotto where sendTr='"+req.params.id+"'");
    let _yyyy       = result[0].yyyy;
    let _wk         = result[0].wk;
    let _regdate    = result[0].regdate;
    let _chips      = result[0].chips;
    let _sendTr     = result[0].sendTr;
    let _numb_tot   = result[0].numb_tot;
    res.render('vtr', { title: 'lotto number', yyyy:_yyyy, wk:_wk, regdate:_regdate, chips:_chips, sendTr : _sendTr, numb_tot : _numb_tot});
  // }
});


function jsfnRepSQLinj(str){
  str = str.replace('\'','`');
  str = str.replace('--','');
  return str;
}
//https://lotto.c4ei.net/myNum/0x0eEA7CA12D4632FF1368df24Cb429dBEa17dD71D
router.get('/ref/:id', function(req, res, next) {
  let ref_addr = jsfnRepSQLinj(req.params.id);
  let sql ="";
  sql = sql +" SELECT id, c4ei_addr, last_ip ";
  sql = sql +" FROM game_user WHERE c4ei_addr='"+ref_addr+"' ";
  console.log("######### index.js 225  ######### "+getCurTimestamp()+" sql: "+sql);
  let result = sync_connection.query(sql);
  if(result.length > 0){
    console.log("######### index.js 228  ######### "+getCurTimestamp()+" result: "+result[0].c4ei_addr);
    res.render('ref', { title: 'ref friend', "result":result });
  }else{
    res.render('ref', { title: 'ref friend', "result":'nodata' });
  }
});

router.post('/ref_ok', function(req, res, next) {
  var txt_ref_addr    = req.body.txt_ref_address;
  var txt_ref_id      = req.body.txt_ref_id;
  var txt_my_addr     = req.body.txt_my_address;
  var user_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
  // console.log(" ### 291 ### "+txt_my_addr + " : txt_my_addr ");
  getAddressCheck(txt_ref_addr);
  getAddressCheck(txt_my_addr);
  getUserInfoByAddress(txt_my_addr, user_ip);
  let sql ="";
  sql = sql +" SELECT id, c4ei_addr, last_ip FROM game_user WHERE id='"+txt_ref_id+"' ";
  console.log("######### index.js 247  ######### "+getCurTimestamp()+" sql: "+sql);
  let result = sync_connection.query(sql);
  if(result.length > 0){
    if(userAcct.reffer_id=='0'){ // my ref
        let result2 = sync_connection.query("update game_user set reffer_id='"+txt_ref_id+"' ,reffer_cnt=reffer_cnt+1, last_reg=now(),last_ip='"+user_ip+"' where id='"+userAcct.id+"'");
        let result3 = sync_connection.query("update game_user set reffer_cnt=reffer_cnt+1, last_reg=now() where id='"+txt_ref_id+"'");
    } else {
      res.render('error', { 'msg' :'you alredy reffer registered' });
      return;    
    }
  }
  console.log(" ### 258 ### "+userAcct.loginCnt + " : loginCnt / TMDiff : " + userAcct.TMDiff );
  res.render('error', { 'msg' :'you success reffer registered' });
});


function sendC4eiFromMining(rcvAddr, rcv_amt, user_ip){
  if(rcv_amt==""){rcv_amt='0.1';}
  var txt_memo = " 10 pot --> 0.1 c4ei ->  mining ";
  //save_db_sendlog(user_id,txt_my_addr,txt_to_address,txt_to_amt,user_ip,txt_memo){
  sendMiningC4EI(17, "0x014B0c7D9b22469fE13abf585b1E38676A4a136f", rcvAddr, rcv_amt, user_ip, txt_memo);
}


////////////////////////// start erc token c4ei //////////////////////////
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
