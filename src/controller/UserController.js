const { userData } = require("../data/UserData");
const { request, response } = require("express");
const { Users } = require("../database/schema/Users");
const { mongoose } = require("mongoose");
class UserController {
  async getAllUsers(req, res = response) {
    // retorna todos los usuarios
    const users = await Users.find({});
    res.status(200);
    res.json(users);
  }

  /**
   * Retorna un usuario por el id
   * @param {*} req
   * @param {*} res
   */
  async getUserById(req = request, res = response) {
    const { id } = req.params;
    try {
      const user = await Users.findById(id).exec();
      res.status(200);
      res.json(user);
    } catch (e) {
      console.error(e);
      res.status(400);
      res.json({ msg: "User not found by id " + id });
    }
  }

  /**
   * crea un usuario
   * @param {*} req
   * @param {*} res
   */
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
      users.id = users._id;
      res.status(201);
      res.json(users);
    } catch (e) {
      res.status(400);
      res.json({ msg: "" + e });
    }
  }
  /**
   * Agregar un score al usuario
   * @param {*} req
   * @param {*} res
   */
  async addScoresOnUser(req = request, res = response) {
    const { id } = req.params;
    const { score } = req.body;
    console.log("BODY: ", req.body, id);
    try {
      //actualizamos el usuario con el score

      await Users.updateOne({ _id: id }, { $addToSet: { scores: req.body } });
      const userResponse = await Users.findById(id).exec();
      res.status(200);
      res.json(userResponse);
    } catch (e) {
      res.status(400);
      res.json({ msg: "" + e });
    }
  }

  async deleteUserById(req = request, res = response) {
    const { id } = req.params;
    try {
      // await Users.findById(id).exec();
      //borramos el usuario
      console.log("el id es", id);
      await Users.deleteOne({ _id: id });

      res.status(204);
      res.json();
    } catch (e) {
      res.status(400);
      res.json({ msg: "" + e });
    }
  }

  async updateUserById(req = request, res = response) {
    const { id } = req.params;
    const user = req.body;
    try {
      const userOriginal = await Users.findById(id).exec();

      const updateUser = {};
      if (userOriginal.userName != user.userName)
        updateUser.userName = user.userName;
      if (userOriginal.email != user.email) updateUser.email = user.email;
      if (userOriginal.password != user.password)
        updateUser.password = user.password;

      updateUser.avatar = user.avatar;

      //actualizamos el usuario
      await Users.updateOne({ _id: id }, updateUser);
      const userResponse = await Users.findById(id).exec();
      res.status(200);
      res.json(userResponse);
    } catch (e) {
      res.status(400);
      res.json({ msg: "" + e });
    }
  }

  async login(req = request, res = response) {
    console.log("BODY: ", req.body);
    const { email, password } = req.body;
    try {
      const user = await Users.findOne({
        email: email,
        password: password,
      }).exec();

      if (!user) throw new Error("user with " + email + " not exits");

      res.status(200);
      res.json();
    } catch (e) {
      res.status(400);
      res.json({ msg: "" + e });
    }
  }
}

const userController = new UserController();
module.exports = { userController };
