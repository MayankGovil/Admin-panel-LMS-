const express = require('express');
require('./config');
const multer = require('multer');

// Create an Express app
const app = express();

app.use(express.json());
const port = 5000;

const cors = require('cors');
app.use(cors());


const Design = require('./modals/AddDesign');

const Product = require('./modals/AddProducts');



const store_productmage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'products');
    }, filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});

const uploadProduct = multer({ storage: store_sliderimage }).single('image');

app.use('/products', express.static(path.join(__dirname, 'products')));



//view only those Designs whose status is ture 
app.get('/ViewDesignsbystatus', async (req, res) => {
    try {
        const designs = await Design.find({ designstatus: true });
        res.status(200).json({ status: true, message: 'Designs founded whose status are Active', data: designs });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post('/AddProduct', uploadProduct, async (req, res) => {
    try {
        const { productcategory, designtopic, finishing, size, productstatus } = req.body;
        const productimage = req.file.filename;

        const newProduct = new Product({ productcategory, designtopic, finishing, size, productstatus, productimage });

        const result = await newProduct.save();
        if (!result) {
            return res.status(404).json({ status: false, message: 'An error has occurred' });
        }
        res.status(200).json({ status: true, message: 'Product Added successfully', data: result });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/viewproducts', async (req, res) => {
    try {
        const products = await Product.find();
        const finalProducts = products.map((item) => ({
            ...item._doc, productimage: `${req.protocol}://${req.get('host')}/products/${item.productimage}`
        }));
        res.status(200).json({ message: 'Products found Successfully', data: finalProducts })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/searchproducts/:searchkey', async (req, res) => {
    let searchKey = req.params.searchKey;
    const design = await Design.find({ designname: { $regex: new RegExp(searchKey, "i") } });
    const designIds = design.map(design => design._id);
    let searchCriteria = [
        { productcategory: { $in: designIds } },
        { designtopic: { $regex: new RegExp(searchKey, 'i') } },
        { finishing: { $regex: new RegExp(searchKey, 'i') } },
        { size: { $regex: new RegExp(searchKey, 'i') } },
    ];
    let productstatus = ['true', 'false'];
    if (productstatus.includes(searchKey.toLowerCase())) {
        searchCriteria.push({ productstatus: searchKey.toLowerCase() });
    };
    try {
        const products = await Product.find({ $or: searchCriteria }).populate('productcategory');
        const finalProducts = products.map((item) => ({
            ...item._doc, productimage: `${req.protocol}://${req.get('host')}/products/${item.productimage}`
        }));
        res.status(200).json({ message: 'products found successfully', data: finalProducts });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' })
    }
});


app.get('/searchproductsByCategory/:id', async (req, res) => {
    let categoryId = req.params.id;
    try {
        const products = await Product.find({ productcategory: categoryId }).populate('productcategory');
        const finalProducts = products.map((item) => ({
            ...item._doc, productimage: `${req.protocol}://${req.get('host')}/products/${item.productimage}`
        }));

        res.status(200).json({ message: 'products found successfully', data: finalProducts });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/getProductby_id/:id', async (req, res) => {
    let id = req.params.id;
    try {
        let ProductData = await Product.findById(id).populate('productcategory');
        ProductData = { ...ProductData._doc, productimage: `${req.protocol}://${req.get('host')}/products/${item.productimage}` }

        if (!ProductData) {
            return res.status(404).json({ message: `Product not found by this id:- ${id}` });
        }
        res.status(200).json({ message: 'Product found successfully', data: ProductData });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.put('/updateProductStatus/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const newstatus = req.body.status;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: `Product not found by this id:- ${id}` });
        }
        const updatedProductStatus = await Product.updateOne(
            { _id: id }, { $set: { productstatus: newstatus } }
        );
        res.status(200).json({ message: 'Product Status updated successfully', data: updatedProductStatus });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" })
    }
});


app.put('/UpdateProduct/:_id', uploadProduct, async (req, res) => {
    const _id = req.params._id;
    const { productcategory, designtopic, finishing, size, productstatus } = req.body;
    let productimage;
    if (req.file) {
        productimage = req.file.filename;
        const existingProduct = await Product.findById(_id);
        if (!existingProduct) {
            return res.status(404).json({ message: `Product not found by this id:-${_id}` });
        }
        try {
            fs.unlinkSync(`products/${existingProduct.productimage}`);
        } catch (err) {
            console.log(`Error in deleting old image:- ${err}`);
        }
    } else {
        const existingProduct = await Product.findById(_id);
        if (!existingProduct) {
            return res.status(404).json({ message: `Product not found by this id:-${_id}` });
        }
        productimage = existingProduct.productimage;
    }
    try {
        const Updatedproduct = await Product.updateOne({ _id }, {
            $set: {
                productcategory, designtopic, finishing, size, productstatus, productimage
            }
        });
        res.status(200).json({ message: 'Slider updated successfully', data: Updatedproduct });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" })
    }
});

app.delete('/deleteProduct/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: `Product not found by this id:- ${id}` });
        }
        const tmp_path = path.join(__dirname, 'products', product.productimage);
        if (fs.existsSync(tmp_path)) {
            fs.unlinkSync(`${__dirname}/products/${product.productimage}`);
        }
        // Delete the team member from the database
        const result = await Product.deleteOne({ _id: id });
        res.status(200).json({ message: 'Product Deleted Successfully', data: result });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" })
    }
});

app.delete('/multipleProductDelete', async (req, res) => {
    try {
        const AllIds = req.body.ids;
        const DeleteImage = await Product.find({ _id: { $in: AllIds } });
        DeleteImage.forEach((product) => {
            const tmp_path = path.join(__dirname, 'products', product.productimage);
            if (fs.existsSync(tmp_path)) {
                fs.unlinkSync(`${__dirname}/products/${product.productimage}`);
            }
        });
        const DeleteProducts = await Product.deleteMany({ _id: { $in: AllIds } });
        res.status(200).json({ message: 'Sliders deleted successfully', data: DeleteProducts });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" })
    }
});

app.listen(port, () => {
    console.log(`the server is listening on ${port}`);
});


