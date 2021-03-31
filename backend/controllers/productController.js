const Product = require("../model/productModel");
//const {errorHandler} = require("../helpers/dberrorHandler");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

//get product by id from the database
exports.productById = (req, res, next, id) => {
    Product.findById(id)
    .exec((err, product) => {
        if(err || !product)
        {
            return res.status(400).json({
                error:'Product not found'
            });
        }
        req.product = product;
        next();
    });
};

// do not get the photo from the database to speed up the return of data, the photo is returned in a different function
exports.readProduct =(req, res,) => {
    req.product.image = undefined
    return res.json(req.product);
};

//create a new product and save data to database
exports.newProduct = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if(err){
            return res.status(400).json({
                error:'Image could not be uploaded'
            });
        }
        let product = new Product(fields);

        //validation for image size
        if (files.image) {
            if(files.image.size > 1000000) {
                return res.status(400).json({
                    error:"Image is to large"
                });
            }
            //check for all data fields
            const {name, description, price, qtyInStock} = fields
            if(!name || !description || !price || !qtyInStock) {
                return res.status(400).json({
                    error:"All fields are required"
                });
            }
            product.image.data = fs.readFileSync(files.image.path)
            product.image.ContentType = files.image.type
        }
        //save product data to database
        product.save((err, result) => {
            if(err){
                return res.status(400).json ({
                    error: 'Error'
                });
            }
            res.json(result);
        });
    });
};

// delete a product from the database 
exports.deleteProduct =(req, res) => {
    let product = req.product
    product.remove((err, deleteProduct) => {
        if(err) {
            return res.status(400).json({
                error: 'Error'
            });
        }
        res.json({
            deleteProduct, "message": "Product sucessfully deleted"
        });
    });
};

//update products in the database
exports.updateProduct = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if(err){
            return res.status(400).json({
                error:'Image could not be uploaded'
            });
        }
        let product = req.product
        product = _.extend(product, fields);

        //validation for image size
        if (files.image) {
            if(files.image.size > 1000000) {
                return res.status(400).json({
                    error:"Image is to large"
                });
            }
            //check for all data fields
            const {name, description, price, qtyInStock} = fields
            if(!name || !description || !price || !qtyInStock) {
                return res.status(400).json({
                    error:"All fields are required"
                });
            }
            product.image.data = fs.readFileSync(files.image.path)
            product.image.ContentType = files.image.type
        }
        //save product data to database
        product.save((err, result) => {
            if(err){
                return res.status(400).json ({
                    error: 'Error'
                });
            }
            res.json(result);
        });
    });
};

// returns a list of products in ascending order, sorts by Id with a limit of 6 returned products 
exports.list = (req, res) => {
    let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    Product.find()
        .select('-image')
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: 'Products not found'
                });
            }
            res.json(products);
        });
};
 
// returns a list of products in descending order, sorts by Id with a limit of 100 returned products 
exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};
 
    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);
 
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
 
    Product.find(findArgs)
        .select("-image")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

//gets the photo data from database and returns it.
exports.image =(req, res, next) => {
    if(req.product.image.data) {
        res.set("Content-Type", req.product.image.contentType);
        return res.send(req.product.image.data);
    }
    next();
};

// // search the database for a product by query incase a search by the name field
exports.listSearch =(req, res) => {
    //create query object to hold search value 
    const query = {};
    
    //aasign search value to query.name
    if(req.query.search) {
        query.name = {$regex: req.query.search, $options: "i"}
        
        //find the product based on query object
        Product.find(query, (err, products) => {
            if(err) {
                return res.status(400).json({
                    error: 'Error'
                });
            }
            res.json(products);
        }).select("-image");
    }
};
