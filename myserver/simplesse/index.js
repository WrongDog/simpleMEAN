var           _  = require('underscore')._;
var simplesse = {};
//simplesse.validateListener(query) for validate
//simplesse.log for output debug log 
simplesse.createId = function(query) {
    return JSON.stringify(query);
}
simplesse.clients=[];
simplesse.addListener = function(req, res, next) {
    if(simplesse.log){
        simplesse.log('addListener',req.query);
    }
    if (simplesse.validateListener && !simplesse.validateListener(req.query)) {
        res.sendStatus(400);
    } else {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive'
        });
        res.write("\n");
        res.write("event: update\n");
		res.write("data: " + JSON.stringify({message:'you are connected!'}) + "\n\n");		
        simplesse.clients.push({ id: simplesse.createId(req.query), query: req.query, res: res });
        req.connection.addListener("close", function() {
            simplesse.clients = _.reject(simplesse.clients, function(client) { return client.id == simplesse.createId(req.query); });
        }, false);
    }

};
simplesse.send = function(filter,messageObject){
    _.each(simplesse.clients,function(client){
        if(filter(client.query)){
           if(simplesse.log){
                simplesse.log('send',{query:client.query,messageObject:messageObject});
            }
           client.res.write("event: update\n");
		   client.res.write("data: " + JSON.stringify(messageObject) + "\n\n");		
        }
    });
}
module.exports = simplesse;