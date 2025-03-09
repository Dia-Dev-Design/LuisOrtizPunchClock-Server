const { model, Schema, default: mongoose } = require('mongoose');

const punchClockSchema = new Schema(
    {
        user: { type: mongoose.Types.ObjectId, ref: 'User' },
        punchIn: { type: String },
        punchOut: { type: String },
        time: { type: String }
    },{
        timestamps: true
    }
)

module.exports = model('PunchClock', punchClockSchema);