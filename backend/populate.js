require('dotenv').config();
const Message = require('./models/message');
const User = require('./models/user');
const {faker} = require('@faker-js/faker');
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

(async ()=>{

for(let i = 0;i<6;i++){
const user = new User({
userName:faker.name.firstName(),
isAdmin:false,
isMember:false,
});
user.password = await bcrypt.hash('fake'+i,10);
await user.save();

const message = new Message({
author:user._id,
title:faker.lorem.word(),
content:faker.lorem.sentence(),
time_stamp:new Date().toDateString(),
});

await message.save();

}

process.exit();
})();
