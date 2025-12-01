
// Error Handler:
function notFound(res,message){
    return res.status(404).json({message:message});
}

function badRequest(res,message){
    return res.status(400).json({message});
}

function notAuthorized(res,message){
    return res.status(401).json({message});
}

function serverError(res,message){
    return res.status(500).json({message});
}

// Succesfull Response:

function ok(res,message,data){
    return res.status(200).json({message,data});
}

function created(res,message,data){
    return res.status(201).json({message,data});
}

module.exports = {
    notFound,
    badRequest,
    serverError,
    notAuthorized,
    ok,
    created
}