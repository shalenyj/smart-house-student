const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ReportSchema = new Schema({
    user: { type: String, required: true },
    type: { type: String, required: true },
    geoPosition: {
        type: {
            default: 'Point'
        },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    status: { type: String, default: 'new' },
    idOfDevice: {
      type: String, required: true
    },
})

module.exports = mongoose.model('Report', ReportSchema)
