//function doTask1(){
//    // Create a new process.
//    var defer = $.Deferred();
//
//    // Start main task in the process.
//    setTimeout(function(){
//        var rslt = Math.floor(Math.random() * 10);
//        console.log("Task 1 returned " + rslt);
//
//        // End the process after successful finish.
//        // Pass the result to callbacks.
//        defer.resolve(rslt);
//    }, 500);
//
//    // Return read-only version of the process.
//    return defer.promise();
//}
//
//function addTask(i){
//    var defer = $.Deferred();
//    setTimeout(function(){
//        var rslt = Math.floor(Math.random() * 10);
//        console.log("addTask finished with " + rslt);
//        defer.resolve(i + rslt);
//    }, 500);
//    return defer.promise();
//}
//
//function multiplyTask(i){
//    var defer = $.Deferred();
//    setTimeout(function(){
//        var rslt = Math.floor(Math.random() * 10);
//        console.log("multiplyTask finished with " + rslt);
//        defer.resolve(i * rslt);
//    }, 500);
//    return defer.promise();
//}
//
//$(function(){
//    // Start task1 in a new process.
//    var task1 = doTask1();
//
//    // Chain next task in a 2nd process based on task1's result.
//    var final = task1.then(function(rslt){
//        if(rslt >= 5)
//            return addTask(rslt);
//        else
//            return multiplyTask(rslt);
//    });
//
//    // Attach success callback to 2nd process.
//    final.done(function(rslt){
//        console.log("All tasks finished with " + rslt);
//    });
//});