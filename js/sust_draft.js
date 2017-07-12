var data = [];
var segmentId = '8mrt6p44w6an';
var siteId = '9222343198115948874';
var baseUrl = 'http://relevant.fi/mitenvoimmeauttaa/yhteistyokumppani/'
var pId = '76b094c3e68cd0b28451d2d65331e4582ff215d1';
document.getElementById('sId').textContent = segmentId;

var cX = cX || {}; cX.callQueue = cX.callQueue || [];
cX.callQueue.push(['setSiteId', siteId])

function appendNewRow(i){
  var resultRowId = 'target' + i;
  var target = document.getElementById("target");
  var row = document.createElement("tr")
  row.id = resultRowId;
  var cell0 = document.createElement("td")
  var cell1 = document.createElement("td")
  cell1.classList.add('state');
  var cell2 = document.createElement("td")
  cell2.classList.add('member');
  var cell3 = document.createElement("td")
  cell3.classList.add('duration');
  
  
  
  cell0.textContent = "#" + i;
  cell1.textContent = 'WAITING';
  cell2.textContent = '';
  cell3.textContent = '';
  
  row.appendChild(cell0)
  row.appendChild(cell1)
  row.appendChild(cell2)
  row.appendChild(cell3)
  
  target.appendChild(row)
  return resultRowId;
}
function delayCall (i, intervalMs, startTime, rowId, doNext){
  data.push(null)
  setTimeout(function(){
    cX.getUserSegmentIds({persistedQueryId:pId, maxAge:0, callback:getUserSegmentIdsCallbackGenerator(i, rowId, startTime, intervalMs, doNext)})
  }, intervalMs)
}

function getUserSegmentIdsCallbackGenerator (i, rowId, time, ms, doNext){
  var iteration = i;
  var resultRowId = rowId;
  var startTime = time
  var intervalMs = ms
  var row = document.getElementById(rowId);
  row.getElementsByClassName('state')[0].textContent = "CHECKING"
  return function(s){
    var isInSegment = s.indexOf(segmentId) >= 0;
    row.getElementsByClassName('member')[0].textContent = isInSegment
    row.getElementsByClassName('member')[0].classList.add(isInSegment)
    
    row.getElementsByClassName('duration')[0].textContent = (((new Date).getTime() - startTime)/1000).toFixed(1)
    row.getElementsByClassName('state')[0].textContent = "DONE" 
    data[iteration] = isInSegment
    
    if (doNext(iteration)){
      iteration = iteration + 1;
      delayCall(iteration, intervalMs, startTime, appendNewRow(iteration), doNext)
    }

  };
}
var start = function(){

  
  cX.callQueue.push(['sendPageViewEvent', { 'location': baseUrl}, function(){
    var intervalMs = parseFloat(document.getElementById("interval").value) * 1000;
    var stableCondition = parseInt(document.getElementById("stableCondition").value);
    var max = parseInt(document.getElementById("max").value);
    fields = document.getElementById("entry").getElementsByTagName('*');      
    for(var f = 0; f < fields.length; f++){
      fields[f].disabled = true;
    }

    var i = 0;
    
    var startTime = (new Date).getTime()
    var doNext = function (i){
      var hasSettled = data.length >= stableCondition && data.slice(data.length-stableCondition).reduce((acc,val)=>{return val ? 1+ acc: acc;}, 0) >=stableCondition;
      var atOrExceedsMax = max > 0 ? i >= max -1 : false;
      
      var ended = (atOrExceedsMax || hasSettled);
      
      if (ended){
        var target = document.getElementById("target");
        var row = document.createElement("tr");
        var cell = document.createElement("td")
        cell.setAttribute('colspan', 4);
        row.appendChild(cell);
        cell.textContent = "TEST ENDED:";
        cell.textContent = atOrExceedsMax ? "TEST ENDED: max iterations": cell.textContent;
        cell.textContent = hasSettled ? "TEST ENDED: stable" : cell.textContent;
        target.appendChild(row);
        return false
      } else {
        return true
      }
    }
    
    delayCall(i, intervalMs, startTime, appendNewRow(i), doNext)
  }]);
  
  
 
  
  
}
document.getElementById("startBtn").addEventListener("click", start);
document.getElementById("entry").addEventListener("submit", function(e){
  e.preventDefault();
    start();
  });
