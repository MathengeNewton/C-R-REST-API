const express = require('express');
const app = express();
const {Client} = require('pg')
//alternative port declaration
const port = process.env.PORT || 3000;

//create a connection to db
let create = `
CREATE TABLE IF NOT EXISTS emails(
    id serial,
    email varchar(255) not null,
    name varchar(255) not null,
    primary key(id)
);
CREATE TABLE IF NOT EXISTS users(
    id serial,
    email varchar(255) not null,
    password varchar(255) not null
);
`
const client = new Client({
    user: 'jack',
    host: 'localhost',
    database: 'jackdreds',
    password: '12345',
    port: 5432,
})

    client.connect()
    client.query(create)
    .then(()=>console.log("connected"))
    .catch(e=>{
            console.log(e)                       
        })


//check emails
const checkemail =(mail)=>{
    if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){
        return true
    }else{
        return false
    }
}
//update logdetails
// const updateLogs=(email)=>{
//     const accessemail = email
//     console.log(accessemail)
//     const accessdate = new Date().toLocaleDateString()
//     console.log(accessdate)
//     const accesstime = new Date().toLocaleTimeString()
//     console.log(accesstime)
//     const query = `INSERT INTO accesslogs(email,date,time)
//                     VALUES(${accessemail},${accessdate},${accesstime})`
                    
//     client.query(query)
//             .then(res =>{
//                 console.log(res)
//             })
//             .catch(error=>{
//                 console.log(error)
//             })
// }
//create account
app.post('/users/register',(req,res)=>{
    if (!req.query || !req.query.email ||!req.query.password || typeof(req.query.email) !== 'string' ||typeof(req.query.password) !== 'string'){
        res.status(400).send(
            {
                status: 400,
                error: "incorrect query format"
            }
        )
    }else{
    const email = req.query.email
    const password = req.query.password
    if(!checkemail(email)){
        res.status(400).send(
            {
                status: 400,
                error: "incorrect email"
            }
        )
    }else if(password.length < 6){
        res.status(400).send(
            {
                status: 400,
                error: "Password too short"
            }
        )  
    }else{
        const query = `INSERT INTO users(email,password)
                        VALUES('${email}','${password}')`
        client
            .query(query)
            .then(queryresponse=>{
                const qr = {
                    username : email
                }
                console.log(queryresponse)
                res.status(200).send(
                    {
                        data: qr
                    }
                )
            })
            .catch(e=>{
                res.status(500).send(
                    {
                        error:'internal server error'
                    }
                )
            })
    }
}
})
//access management..log in
app.get('/users/login',(req,res)=>{
    if (!req.query || !req.query.email ||!req.query.password || typeof(req.query.email) !== 'string' ||typeof(req.query.password) !== 'string'){
        res.status(400).send(
            {
                status: 400,
                error: "incorrect query format"
            }
        )
    }else{
    const email = req.query.email
    const password = req.query.password
    if(!checkemail(email)){
        res.status(400).send(
            {
                status: 400,
                error: "incorrect email"
            }
        )
    }else if(password.length < 6){
        res.status(400).send(
            {
                status: 400,
                error: "Password too short"
            }
        )  
    }else{
    const query = `SELECT * FROM users WHERE email = '${email}'`
    client
    .query(query)
    .then(r=>{
        const queryrows = r.rows.length
        if(!queryrows){
            res.send(
                {
                    status: 204,
                    message: `no account with email: ${email}`
                }
            )
        }else{
            const fr = r.rows[0]
            const localpass = fr['password']
            if(localpass == password){
                // updateLogs(email)
                res.status(200).send(
                    {
                        user: email,
                        status: `access granted `
                        
                    }
                )
            }else{
                res.status(204).send(
                    {
                        user: email,
                        status:`access denied `
                    }
                )
            }
         }
        })
        .catch(e=>{
            console.log(e)
            res.status(500).send(
                {
                    error: `Internal server error`
                }
            )
        })
    }
   }
})
//get req to all records in files
app.get('/emails',(req,res)=>{
    if(!req.method == 'get'){
        res.status(400).send(
            {
                status:200,
                error:'bad request method'
            }
        )
    }else{
    const query = 'SELECT * FROM emails;'
    client
        .query(query)
        .then(r => {
            let sdata = r.rows.length
            if (sdata > 0){       
                console.log(r.rows.email)         
                res.status(200).send(
                    {
                        staus: 200,
                        records: r.rows
                    }
                )
            }else{
                res.send(
                    {
                        status: 204,
                        message: '*no emails available'
                    }
                )
            }
        })
        .catch(err =>{
            res.status(500).send(
                {
                    error: "internal server error"
                }
            )
        })
    }
})
//get email by request
app.get('/email',(req,res)=>{
    if (!req.query || !req.query.email || typeof(req.query.email) !== 'string' || !req.method == 'get'){
        res.status(400).send(
            {
                status: 400,
                error: "incorrect query format"
            }
        )
    }else{
    const email = req.query.email
    if(!checkemail(email)){
        res.status(400).send(
            {
                status: 400,
                error: "incorrect email"
            }
        )
    }else{
        const query = `SELECT * FROM emails WHERE email = '${email}';`
        client
        .query(query)
        .then(r=>{
            let sdata = r.rows.length
            if (sdata > 0){
                res.status(200).send(
                    {
                        status: 200,
                        data: r.rows
                    }
                )
            }else{
                res.send(
                    {
                        status: 204,
                        message: '*email not available'
                    }
                )
            }
                            
            })
        .catch(err =>{
            res.send(
                {
                    status:500,
                    error:"internal server error"
                }
            )
        })

      }
    }
})

//add new record to the database
app.post('/email/add',(req,res)=>{
    if(!req.query ||!req.method == 'post' || !req.query.email || !req.query.name){
        res.status(400).send(
            {
                status: 400,
                error: "incorrect query format"
            }
        )
    }else if(req.query.name.length <= 5){
        res.status(400).send(
            {
                status: 400,
                error: "name too short"
            }
        )
    }else if(req.query.email.length < 10){
        res.status(400).send(
            {
                status: 400,
                error: "invalid email"
            }
        )
    }else if(typeof(req.query.name) !== 'string'){
        res.status(400).send(
            {
                status: 400,
                error: "name should be of type String"
            }
        )
    }else if(!checkemail(req.query.email)){
        res.status(400).send(
            {
                status: 400,
                error: "incorrect email"
            }
        )
    }else if(typeof(req.query.email) !== 'string'){
        res.status(400).send(
            {
                status: 400,
                error: "email should be of type String"
            }
        )
    }else{
    
    const sentname = req.query.name
    const sentemail = req.query.email
    const query = `INSERT INTO emails(email,name)
                VALUES('${sentemail}','${sentname}')`
    client
        .query(query)
        .then(r =>{
            const mres = {
                data:{
                    name: sentname,
                    email: sentemail
                }
            }
            res.status(200).send(mres)            
        })
        .catch(
            e =>{
                console.log(`this error is ${e}`)
                res.status(500).send(
                    {
                        status:500,
                        error: e
                    }
                )
            }
        ) 
    }
})

app.listen(port,()=>{
    console.log(`server listening to port ${port}...`)
})