const Product = require("../models/product");
const cloudinary = require("../utils/cloudinary");

exports.CreateProduct = async (req, res) => {
  const { name, brand, desc, category, price, image } = req.body;
  try {
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      upload_preset: "online-Shop";
      if (uploadResponse) {
        const product = new Product({
          name,
          brand,
          desc,
          category,
          price,
          image: uploadResponse,
        });
        const savedProduct = await product.save();
        res.status(200).send(savedProduct);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.fetchAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    res.status(200).send(products);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.SearchProduct = async (req, res) => {
  try {
    const keyword = req.params.keyword;
    // const categoryOptions = [
    //   "Men",
    //   "Women",
    //   "Phones",
    //   "Laptops",
    //   "Bags",
    //   "Kitchen",
    //   "Snacks",
    //   "Electronics",
    //   "Furnitures",
    // ];
    // category === "All"
    //   ? (category = [...categoryOptions])
    //   : (category = req.query.category.split(","));
    // req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

    // const sortQuery = {
    //   createdAt: sort === "desc" ? -1 : 1,
    // };

    // const name = new RegExp(searchQuery, "i");
    const results = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { brand: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { desc: { $regex: keyword, $options: "i" } },
      ],
    });
    res.status(200).send(results);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
};

exports.fetchProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error);
  }
};

//update product

exports.UpdateProduct = async (req, res) => {
  try {
    if (req.body.productImg) {
      const destroyResponse = await cloudinary.uploader.destroy(
        req.body.product.image.public_id
      );
      if (destroyResponse) {
        const uploadResponse = await cloudinary.uploader.upload(
          req.body.productImg
        );
        upload_preset: "online-Shop";
        if (uploadResponse) {
          const updatedproduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
              $set: {
                ...req.body.product,
                image: uploadResponse,
              },
            },
            { new: true }
          );
          res.status(200).send(updatedproduct);
        }
      }
    } else {
      const updatedproduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...req.body.product,
          },
        },
        { new: true }
      );
      res.status(200).send(updatedproduct);
    }
  } catch (err) {
    res.status(500).send(error);
  }
};

//Delete product
exports.DeleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found!");
    if (product.image.public_id) {
      const destroyResponse = cloudinary.uploader.destroy(
        product.image.public_id
      );
      if (destroyResponse) {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        res.status(200).send(deletedProduct);
      }
    } else {
      console.log("Action terminated, Failed to delete product image...");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};
