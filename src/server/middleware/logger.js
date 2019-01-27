var logger = (message)=>{
    console.log( `[${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}]` , message)
};

module.exports = {logger}