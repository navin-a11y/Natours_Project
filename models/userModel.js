const crypto = require("crypto");
const moongose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new moongose.Schema({
  name: {
    type: String,
    require: [true, "A user must have their name"],
  },
  email: {
    type: String,
    require: [true, "must enter email if"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "pls enter a valid email"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "pls provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "pls confirm your password"],
    validate: {
      // This only works on CREATE & SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: "password are not the same!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// password encryption
userSchema.pre("save", async function (next) {
  // only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  //hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete the passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt=Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  // this points to current query
  this.find( {active: {$ne: false} });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // check it's not printing password change time
  if (this.passwordChangedAt) {
    console.log(this.passwordChangedAt);
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10 /* base 10 */
    );

    console.log(this.passwordChangedAt, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  // False means not changed!
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = moongose.model("User", userSchema);

module.exports = User;
