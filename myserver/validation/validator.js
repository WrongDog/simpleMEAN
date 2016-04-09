(function(name, definition) {
    if (typeof module != 'undefined') module.exports = definition();
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition);
    else this[name] = definition();
}('projectValidator', function() {
    
    return {
        validate: function(project) {
            var result = [];
            if(!project){
                result.push({message:'project can not be empty'});
            }else{
                if(!project.name){
                   result.push({field:'name',message:'project name can not be empty'}); 
                }
            }
            return result;
        },
        
    };
}));