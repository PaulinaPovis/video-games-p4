const { userData } = require("../data/UserData");
const { request, response } = require("express");
const { Users } = require("../database/schema/Users");
const { mongoose } = require("mongoose");
class UserController {
  
  async getAllUsers(req, res = response) {
    
    res.status(200);
    //const users = Users;
    const users = await Users.find({});
    res.json(users);

  }

  getUserById(req = request, res = response) {
    const { id } = req.params;
    const user = userData.users.find((u) => u.id == id);
    res.status(200);
    res.json(user);
  }

  async createUser(req = request, res = response) {
    try {
      console.log("# end creating user with mongodb");
      const user = req.body;

      //creando el objeto que se insertara en mongodb
      const users = new Users({
        userName: user.userName,
        email: user.email,
        password: user.password,
        avatar: user.avatar,
      });
      // guardando el objecto users en mongo
      await users.save();
      users.id=users._id; 
      res.status(201);
      res.json(users);
    } catch (e) {
      console.error("---->", e);
      res.status(400);
      res.json({ msg: "" + e });
    }
  }

  addScoresOnUser(req = request, res = response) {
    const { id } = req.params;
    console.log("BODY: ", req.body, id);
    res.status(200);
    res.json({});
  }

  deleteUserById(req, res) {}

  updateUserById(req, res) {}

  login(req = request, res = response) {
    console.log("BODY: ", req.body);
    const { email, password } = req.body;
    console.log(email);
    const existe = userData.users.find(
      (u) => u.email == email && u.password == password
    );
    console.log("<<<<<" + existe);
    if (existe != undefined) {
      res.status(200);
    } else if (existe == undefined) {
      res.status(202);
      res.json({ mssg: "The user does not exists! Please Sign-up!" });
    } else res.status(400);

    res.json(existe);
  }
}

const userController = new UserController();
module.exports = { userController };
