const mongoose = require("mongoose")

module.exports.connect = async (dsn) => mongoose.connect(dsn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connect(app.get('env') === 'production' ? `mongodb+srv://protege47007:${process.env.PASS}@cluster0.5nisq.mongodb.net/easycareDb` : 'mongodb://localhost:27017/easycareDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});