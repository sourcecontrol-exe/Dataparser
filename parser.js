/// database connecivity ///
const psc = require('postfix-calculator')
/////////////////////////////
let dbarray=[];
var pck1={
  p_id :[0,4,"1111"],
  p_token :[4,8],
  len:25,
  key_inc:18,
  ///////////
  node_id:[8,14],
  spc:{load:"volt curr - volt curr + /",'curr+volt':"volt curr +"},
  //////////
  volt :[14,22,"HS",'F'," volt 10 -"],
  curr :[22,26,'HS','I',"curr 2 /"]

}

//"volt 231 * volt -"
var pck2={
  p_id :[0,4,"1121"],
  p_token:[5,10],
  len:3,
  key_inc:10,
  node_id:[10,16],
  status:[16,20,"HS","F"]
}
var pck3={
  p_id:[0,4,"1212"],
  p_token:[5,12],
  len:2,
  key_inc:12,
  node_id:[12,18],
  voltage:[18,20,'IS','I'],
  current:[20,22,"HS","I"],
  inten:[22,24,"BS","F","inten inten +"],
  freq:[24,26,"S","F",'freq freq *']
}
/////////////////////////////////////////////////////////





var solvePostfix = function(postfix) {
        var resultStack = [];
        postfix = postfix.split(" ");
        for(var i = 0; i < postfix.length; i++) {
            if(postfix[i].isNumeric()) {
                resultStack.push(postfix[i]);
            } else {
                var a = resultStack.pop();
                var b = resultStack.pop();
                if(postfix[i] === "+") {
                    resultStack.push(parseInt(a) + parseInt(b));
                } else if(postfix[i] === "-") {
                    resultStack.push(parseInt(b) - parseInt(a));
                } else if(postfix[i] === "*") {
                    resultStack.push(parseInt(a) * parseInt(b));
                } else if(postfix[i] === "/") {
                    resultStack.push(parseInt(b) / parseInt(a));
                } else if(postfix[i] === "^") {
                    resultStack.push(Math.pow(parseInt(b), parseInt(a)));
                }
                else if(postfix[i] === "%" ) {
                    resultStack.push(parseInt(b) % parseInt(a))
                }
            }
        }
        if(resultStack.length > 1) {
            return "error";
        } else {
            return resultStack.pop();
        }
    }
/////////////////////////////////////////////////////////////////
String.prototype.isNumeric = function() {
    return !isNaN(parseFloat(this)) && isFinite(this);
}

//////////////////////////////////////////////////////////////////
String.prototype.replaceAll = function(str1, str2, ignore)
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}
//////////////////////////////////////////////////////////////////////
var postcal=function(postfixStr,key,val){
  var str=postfixStr.replaceAll(key,val);
  return solvePostfix(str)
}

var hex2d = function(hex) //hex to decimal
{
    var result = 0, digitValue;

    if(typeof(hex)=='string')
    {
    hex=hex.toLowerCase();
    }
    else
    {
    hex = hex.toString().toLowerCase();
    }

    for (var i = 0; i < hex.length; i++)
    {
        digitValue = '0123456789abcdefgh'.indexOf(hex[i]);
        result = result * 16 + digitValue;
    }
    return result;
}
////////////////////////////////////////////////////////
var hex2f=function(str) //hex to float
        {

        if (str=="00000000")
                return 0;
        var strar=str.split('');
        var data=[];
        var tempdata=[];
        var k =0;
        var l =1;

                for(var i=1;i<=4;i++)
                {
                        tempdata[i-1]=strar[k]+strar[l];
                        k +=2;
                        l +=2;
                }

                for(var b=0;b<tempdata.length;b++)
                {
                var def=hex2d(tempdata[b]);
                data=data.concat(def);
                }

                var buf = new ArrayBuffer(4);
                // Create a data view of it
                var view = new DataView(buf);

                // set bytes
                data.forEach(function (b, i) {
                    view.setUint8(i, b);
                });
                //Read the bits as a float; note that by doing this, we're implicitly
                // converting it from a 32-bit float into JavaScript's native 64-bit double
                var num = view.getFloat32(0);
                // Done
                //console.log(num);
                return num;
        }
/////////////////////////////////////////


dbarray.push(pck1);
dbarray.push(pck2);
dbarray.push(pck3);
 //////////////////////

/// packet array ///


/////////////////////


var pidIndex = (data)=>{
  var i=0
  for(i=0;i<=dbarray.length-1;i++){

    if(dbarray[i]['p_id'][2]==data.substring(dbarray[i]['p_id'][0],dbarray[i]['p_id'][1]))
    {
            break;
    }
  }
  //console.log(i)
  if(i == dbarray.length){
    return -1
  }
  else
    return i

}


function checkstring(index,data)
{
  var expected_attributelen=dbarray[index]['key_inc']*dbarray[index]['len']
  var expected_authlen=((dbarray[index]['p_token'][1])-dbarray[index]['p_id'][0])
  var expected_totallen=expected_attributelen+expected_authlen;
  return expected_totallen;
}


var startParsing = (index,data) =>{

  var originalobject=dbarray[index];
  var keys=Object.keys(dbarray[index]);
  //console.log(keys);
  var spc_flag = 0
  var packlen=dbarray[index]['len'];
  var packinc = dbarray[index]['key_inc']
  var info={}
  var nodeid;
  //
  info['token']=data.substring(dbarray[index]['p_token'][0],dbarray[index]['p_token'][1])
  //
  for(var i = 0; i<packlen;i++)
  {
    // var nodeid=data.substring(dbarray[index]['node_id'][0],dbarray[index]['node_id'][1]);
    // console.log(nodeid);
    for(var j = 0; j < keys.length; j++){
      if(keys[j]=='p_id' || keys[j]=='p_token' || keys[j]=='len' || keys[j]=='key_inc'){
        continue
      }
      else if( keys[j] =='spc'){
        spc_flag=1
      }
      else{
        var keyrow = dbarray[index][keys[j]]
          //console.log(dbarray[index][keys[j]])
          if(keys[j]=='node_id'){
            nodeid =data.substring(dbarray[index][keys[j]][0],dbarray[index][keys[j]][1]);
            //console.log(nodeid)
            info[nodeid]={}
          }
          else{

          switch(keyrow[2])
          {
            case "HS":
                    try{
                    //console.log("I am in hex Case");
                    var result
                    var data_p=data.substring(keyrow[0],keyrow[1]);
                    //console.log((data_p)
                    switch(keyrow[3]){
                      case 'F':
                              result=hex2f(data_p)
                              break;
                      case 'I':
                              result=hex2d(data_p)
                              break;
                      default:
                              result=hex2f(data_p)
                    }
                    //////
          if(dbarray[index][keys[j]][4] != ''){
            result=postcal(dbarray[index][keys[j]][4],keys[j],result.toString())
            }
                    //////
                    //var resobj={}
                    //resobj[keys[j]]=result
                    var key = keys[j].toString()
                    info[nodeid][key]=(result.toString())
                    }
                    catch(e){
                      console.error(e.message)
                    }
                    break;

            case "IS":
                    try{
                    //console.log("I am int string Case");
                    var data_p=data.substring(keyrow[0],keyrow[1]);
                  //  console.log(data_p);
                    }
                    catch(e){
                      console.error(e.message)
                    }
                    break;


           case "FS":
                   try{
                   //console.log("I am float string Case");
                   var data_p=data.substring(keyrow[0],keyrow[1]);
                //   console.log(data_p);
                   }
                   catch(e){
                     console.error(e.message)
                   }
                   break;
           case "BS":
                   try{
                   //console.log("I am int  binary string Case");
                   var data_p=data.substring(keyrow[0],keyrow[1]);
                //   console.log(data_p);
                   }
                   catch(e){
                     console.error(e.message)
                   }
                   break;
            case "S":
            try{
                    //console.log("I am string Case");
                    var data_p=data.substring(keyrow[0],keyrow[1]);
                //    console.log(data_p);
                    }
                    catch(e){
                      console.error(e.message)
                    }
                    break;
            default :
            console.log("packet not defined");
            break;

          }
        }
          dbarray[index][keys[j]][0] += packinc
          dbarray[index][keys[j]][1] +=packinc
          //console.log(dbarray[index][keys[j]])

        }

      }

    }

    //
    // special cases handling
    if(spc_flag ==1 ){
      //console.log("special case exists")
      var i,j,k;

      //console.log(keys1)
      var mainkeys = Object.keys(dbarray[index]['spc'])
      for(i=0; i< mainkeys.length;i++){
        var opsc =  dbarray[index]['spc'][mainkeys[i]]
        var keys1 =Object.keys(info)
        for(j=0;j<keys1.length;j++){
          var spc = dbarray[index]['spc'][mainkeys[i]]
          if(keys1[j]=='token'){
            continue
          }
          else{
            //console.log(keys1[j])
            var keys2 = Object.keys(info[keys1[j]])
            //console.log(keys2)
             for(k=0;k<keys2.length;k++){
               var key = keys2[k]
               var value = info[keys1[j]][keys2[k]]
               spc =spc.replaceAll(key,value)

             }
             info[keys1[j]][mainkeys[i]]=solvePostfix(spc)
          }
          spc = dbarray[index]['spc'][i]
        }
      }

    }

    //
  dbarray[index]=originalobject;
  console.log(info)


}

////////////////////
var parse= (data)=>{
  var index = pidIndex(data)
  if (index!=-1){
  var stringlencheck=checkstring(index,data)
  //console.log(stringlencheck);
  if(stringlencheck!=data.length){ console.log(data.length);
    console.log(((dbarray[index]['p_token'][1])-dbarray[index]['p_id'][0])+(dbarray[index]['key_inc']*dbarray[index]['len']))
  console.log("packet lenght is insufficient or larger than expected")
  }
  else{
  var finalData=startParsing(index,data)
}
}
  else{
    console.log("packet type mot found");
  }
}
var str='1111halo000001437000000096000002437000000096000003437000000096000004437000000096000005043700000009600006437000000096000070437000000096000080437000000096000090437000000096000010437000000096000011437000000096000012437000000096000013437000000096000014437000000096000015437000000096000016437000000096000017437000000096000018437000000096000019437000000096000020437000000096000021437000000096000022437000000096000023437000000096000024437000000096000025437000000096';
var str3="12127654321vo1c1int1fr1vo2c2int2fr2";
var str2="112198765stat1stat2stat3";
parse(str);
//parse(str2)
//parse(str3);

