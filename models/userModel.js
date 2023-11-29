const moongose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = moongose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },

  email: {
    type: String,
    required: [true, 'Please provide an email'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
    unique: true,
  },

  photo: String,

  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, // This prevents this field from being displayed in the API response
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // The el is the current field in the model e.g passwordConfirm
      // The validator is only called when using Model.save()  or  Model.create() and not with Model.update()
      // Therefore it is best to use .save() when updating a document in the DB
      validator: function (el) {
        return el === this.password;
      },
      message: 'The passwords should match',
    },
  },
  passwordChangedAt: Date,
});

// Before the data is saved to the DB
userSchema.pre('save', async function (next) {
  // This checks if there was any modification to the password field, if not the password encryption is not performed
  if (!this.isModified('password')) return next();

  // The this referes to the current document being saved
  this.password = await bcrypt.hash(this.password, 12); // 12 defines how secure the new hashed password will be
  // The passwordConfirm field is not actually needed in the DB itself. It's only required at the time of input to check perform validation
  this.passwordConfirm = undefined;
});

// This instance method will be availabe to each document from the users collection
userSchema.methods.correctPassword = async function (
  testPassword,
  userPassword,
) {
  //this.password not available because the password field was deselected from the output
  return await bcrypt.compare(testPassword, userPassword);
};

// This instance method is used to check if the user password has been changed after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const chnagedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    // Password was changed after the issuing of the token
    if (chnagedTimeStamp >= JWTTimestamp) {
      return true;
    }
  }
  // Not changed after issuing token
  return false;
};

const User = moongose.model('User', userSchema);

module.exports = User;
