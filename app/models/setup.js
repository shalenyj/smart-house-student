const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SetupSchema = new Schema({
  user: { type: String, required: true, unique: true },
  elements: [
    {
      type: { type: String, required: true, immutable: true },
      name: { type: String, required: true },
      settings: {
        start: { type: String }, // 12:15
        end: { type: String }, // 13:20
        count: { type: Number }, // 5
        duration: { type: Number }, // 300 in seconds
        weatherSupport: { type: Boolean, default: false }
      },
      isActive: { type: Boolean, default: false },
      motherBoardId: { type: String, default: '' }
    }
  ],
  geoPosition: {
    type: {
      default: 'Point'
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
});

module.exports = mongoose.model('Setup', SetupSchema);
