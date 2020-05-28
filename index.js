const express = require('express');
const app = express();
const {Client} = require('pg')
//alternative port declaration
const port = process.env.PORT || 3000;

//create a connection to db

const client = new Client({
    user: 'jack',
    host: 'localhost',
    database: 'jackdreds',
    password: '12345',
    port: 5432,
})
client.connect()

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
            res.status(200).send(
                    {
                        staus: 200,
                        records: r.rows
                    }
                )
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
    console.log(email)
    const query = `SELECT * FROM emails WHERE email = '${email}';`
    console.log(query)
    client
        .query(query)
        .then(r=>{
                res.status(200).send(
                    {
                        status: 200,
                        data: r.rows
                    }
                )            
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
})
let checkemail =(mail)=>{
    if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){
        return true
    }else{
        return false
    }
}
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