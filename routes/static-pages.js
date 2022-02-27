const router = require('express').Router() ;
const{home,  contact, } = require('../controller/static/index');

router.get('/', home)
// router.get('/news', news)
// router.get('/about', about);
// router.get('/services', services);
router.get('/contact', contact);

module.exports = router;