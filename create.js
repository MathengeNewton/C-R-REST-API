const express = require('express');
const {Client} = require('pg')

let create = `
CREATE TABLE emails(
    id serial,
    email varchar(255) not null,
    name varchar(255) not null,
    primary key(id)
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
  client
  .query(create)
  .then(res => {
      console.log(res)
  })
  .catch(err => console.log(err))
