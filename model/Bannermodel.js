
const mongoose = require('mongoose')



const bannerSchema = new mongoose.Schema({
    title: {
        type: String
    },
    images:{
        type:Object,
        require:true
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date
    }
})
const Banner = mongoose.model('banner', bannerSchema);

module.exports = Banner