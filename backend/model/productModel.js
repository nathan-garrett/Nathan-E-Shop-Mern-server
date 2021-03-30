const mongoose = require("mongoose");

//Database schema
const productSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            trim: true,
            required: true,
            maxlength: 64
        },
        description:{
            type: String,
            trim: true,
            required: true,
            maxlength: 2000
        },
        qtyInStock:{
            type: Number,
            required: true
        },
        price: {
            type: Number,
            trim: true,
            required: true
        },
        image: {
            data: Buffer,
            contentType: String
        }    
    
    },
    {timestamps: true}
);
module.exports = mongoose.model("Product", productSchema);