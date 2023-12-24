const http = require('http')
const fs = require('fs/promises')
const PORT = 3500

const server = http.createServer(async function(req, res){
    res.writeHead(200, {'Content-Type': 'text/html'})
    const html = await fs.readFile('./index.html', 'utf-8', function(error, data) {
        if (error) throw error
        else return data
    })
    res.write(html)
    res.end()
})

server.listen(PORT, function(){
    console.log('Server listenting to PORT: ' + PORT)
})