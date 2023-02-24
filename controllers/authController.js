const bcrypt = require("bcrypt");
const User = require("../models/user");
const genAuthToken = require("../utils/genAuthToken");

//get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ _id: -1 });
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    //specifying to avoid sending the password
    res.status(200).send({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

//update user
exports.updateUser = async (req, res) => {
  const { name, email, isAdmin } = req.body;
  try {
    const user = await User.findById(req.params.id);
    //email change check
    if (!(user.email === req.body.email)) {
      const emailInUse = User.findOne({ email: req.body.email });
      if (emailInUse) return res.status(400).send("email is already in use");
    }
    if (req.body.password && user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword;
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: name,
        email: email,
        isAdmin: isAdmin,
        password: user.password,
      },
      { new: true }
    );
    res.status(200).send({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } catch (error) {
    res.status(500).send(err);
  }
};

//delete user by id
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.status(200).send(deletedUser);
  } catch (error) {
    res.status(500).send(error);
  }
};

//Register user controller
exports.RegisterUser = async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send(" User with this email exist... ");

  const { name, email, password } = req.body;

  user = new User({
    name: name,
    email: email,
    password: password,
  });
  user.password = await bcrypt.hash(user.password, 10);
  user = await user.save();
  const token = genAuthToken(user);
  res.send(token);
};

//login user controller
exports.LoginUser = async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email: email });
  if (!user) return res.status(400).send(" Invalid Email or Password ");
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).send(" Invalid Email or Password ");
  const token = genAuthToken(user);
  res.send(token);
};
