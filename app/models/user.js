const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_WORK_FACTOR = 10;

const UserSchema = new mongoose.Schema({
  firstName: { type: String, trim: true },
  secondName: { type: String, trim: true },
  geoPosition: {
    type: {
      default: 'Point'
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  phone: { type: Number },
  password: { type: String, required: true, immutable: true },
  email: { type: String, required:  true, unique: true, immutable: true },
  isAdmin: { type: Boolean, default: false, immutable: true },
}, { timestamps: { createdAt: 'created_at' } });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')){
    next();
  }
  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  const hash = await  bcrypt.hash(this.password, salt);
  this.password = hash;
  next();
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generateMainToken = function () {
  return jwt.sign({
    isAdmin: this.isAdmin,
    email: this.email,
  }, process.env.JWT_SECRET, { expiresIn: '1d' });
  // To simplify keep jwt long-life
};

UserSchema.methods.getUserData = function () {
  return {
    firstName: this.firstName,
    secondName: this.secondName,
    geoPosition: this.geoPosition,
    phone: this.phone,
    email: this.email,
  };
  // To simplify keep jwt long-life
};


module.exports = mongoose.model('User', UserSchema);
