import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { hashPassword } from "../utils/bcrypt.js";


const userSchema = new mongoose.Schema({
  name: { type: String, required: true, },
  email: { type: String, required: true, unique: true, min: 2, max: 60, },
  password: { type: String, required: true, },
}, {
  versionKey: false,
  timestamps: true,
});

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    this.password = await hashPassword(this.password);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    try {
      update.password = await hashPassword(update.password);
      this.setUpdate(update);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;