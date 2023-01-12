const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const UrlSchema=new Schema({
    original_url: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    clicks: {
        type: Number,
        default: 0
    },
    expiry:{
        type:Number,
    }
});

module.exports=mongoose.model('Url',UrlSchema);