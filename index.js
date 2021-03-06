const express = require('express');
const app = express();
const {Client} = require('pg');
const env = require('dotenv').config();
//alternative port declaration
const port = process.env.PORT || 3000;

//create a connection to db
let create = `
CREATE TABLE IF NOT EXISTS messages(
    id serial,
    email varchar(255) not null,
    message varchar(255) not null,
    date varchar(255),
    primary key(id)
);
CREATE TABLE IF NOT EXISTS users(
    id serial,
    email varchar(255) not null unique,
    password varchar(255) not null
);
`
const client = new Client({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_URL,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT
})

    client.connect().catch(e=>console.log(e))
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


//create account
// app.post('/api/users/register',(req,res)=>{
//     if (!req.query || !req.query.email ||!req.query.password || typeof(req.query.email) !== 'string' ||typeof(req.query.password) !== 'string'){
//         res.status(400).send(
//             {
//                 status: 400,
//                 error: "incorrect query format"
//             }
//         )
//     }else{
//     const email = req.query.email
//     const password = req.query.password
//     if(!checkemail(email)){
//         res.status(400).send(
//             {
//                 status: 400,
//                 error: "incorrect email"
//             }
//         )
//     }else if(password.length < 6){
//         res.status(400).send(
//             {
//                 status: 400,
//                 error: "Password too short"
//             }
//         )  
//     }else{
//         const query = `INSERT INTO users(email,password)
//                         VALUES('${email}','${password}')`
//         client
//             .query(query)
//             .then(queryresponse=>{
//                 const qr = {
//                     username : email
//                 }
//                 console.log(queryresponse)
//                 res.status(200).send(
//                     {
//                         data: qr
//                     }
//                 )
//             })
//             .catch(e=>{
//                 res.status(500).send(
//                     {
//                         error:'Check your email and try again'
//                     }
//                 )
//             })
//     }
// }
// })

// //access..log in
// app.get('/api/users/login',(req,res)=>{
//     if (!req.query || !req.query.email ||!req.query.password || typeof(req.query.email) !== 'string' ||typeof(req.query.password) !== 'string'){
//         res.status(400).send(
//             {
//                 status: 400,
//                 error: "incorrect query format"
//             }
//         )
//     }else{
//     const email = req.query.email
//     const password = req.query.password
//     if(!checkemail(email)){
//         res.status(400).send(
//             {
//                 status: 400,
//                 error: "incorrect email"
//             }
//         )
//     }else if(password.length < 6){
//         res.status(400).send(
//             {
//                 status: 400,
//                 error: "Password too short"
//             }
//         )  
//     }else{
//     const query = `SELECT * FROM users WHERE email = '${email}'`
//     client
//     .query(query)
//     .then(r=>{
//         const queryrows = r.rows.length
//         if(!queryrows){
//             res.send(
//                 {
//                     status: 204,
//                     message: `no account with email: ${email}`
//                 }
//             )
//         }else{
//             const fr = r.rows[0]
//             const localpass = fr['password']
//             if(localpass == password){
//                 res.status(200).send(
//                     {
//                         user: email,
//                         status: `access granted `
                        
//                     }
//                 )
//             }else{
//                 res.status(204).send(
//                     {
//                         user: email,
//                         status:`access denied `
//                     }
//                 )
//             }
//          }
//         })
//         .catch(e=>{
//             console.log(e)
//             res.status(500).send(
//                 {
//                     error: `Internal server error`
//                 }
//             )
//         })
//     }
//    }
// })
//get all records in files
app.get('/api/messages',(req,res)=>{
    if(!req.method == 'get'){
        res.status(400).send(
            {
                error:'bad request method'
            }
        )
    }else{
    const query = 'SELECT * FROM messages;'
    client
        .query(query)
        .then(r => {
            let sdata = r.rows.length
            if (sdata > 0){               
                res.status(200).send(
                    {
                        records: r.rows
                    }
                )
            }else{
                res.status(204).send(
                    {
                        message: '*no messages available'
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
app.get('/api/message',(req,res)=>{
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
                error: "incorrect email"
            }
        )
    }else{
        const query = `SELECT * FROM messages WHERE email = '${email}' ORDER BY date DESC;`
        client
        .query(query)
        .then(r=>{
            let sdata = r.rows.length
            if (sdata > 0){
                res.status(200).send(
                    {
                        data: r.rows
                    }
                )
            }else{
                res.status(204).send(
                    {
                        message: '*email not available'
                    }
                )
            }
                            
            })
        .catch(err =>{
            res.status(500).send(
                {
                    error:"internal server error"
                }
            )
        })

      }
    }
})

//add new record to the database
app.post('/api/message/add',(req,res)=>{
    if(!req.query ||!req.method == 'post' || !req.query.email || !req.query.message){
        res.status(400).send(
            {
                error: "incorrect query format"
            }
        )
    }else if(req.query.email.length < 10){
        res.status(400).send(
            {
                error: "invalid email"
            }
        )
    }else if(!checkemail(req.query.email)){
        res.status(400).send(
            {
                error: "incorrect email"
            }
        )
    }else{
    
    const sentmessage = req.query.message
    const sentemail = req.query.email 
    const date = new Date().toLocaleDateString()
    console.log(date)
    const query = `INSERT INTO messages(email,message,date)
                VALUES('${sentemail}','${sentmessage}','${date}')`
    client
        .query(query)
        .then(r =>{
            const mres = {
                data:{
                    email: sentemail,
                    response: `Your message was received`
                }
            }
            res.status(200).send(mres)            
        })
        .catch(
            e =>{
                console.log(`the error is ${e}`)
                res.status(500).send(
                    {
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