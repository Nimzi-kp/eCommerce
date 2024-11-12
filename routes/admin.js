var express = require('express');
var fs = require('fs')
var router = express.Router();
var productHelpers = require('../helpers/products-helpers');

const verifyAdmin = (req,res,next)=>{
  if(req.session.adminLoggedIn){
    next()
  }else{
    res.redirect('/admin/adminlogin')
  }
}

/* GET users listing. */
router.get('/', verifyAdmin, function (req, res, next) {
  productHelpers.getAllProduct().then((products) => {
    let admin = req.session.admin
    res.render('admin/view-prodects', { admin, products, ad:true });
  });
});

router.get('/adminlogin', (req, res) => {
  if (req.session.adminLoggedIn) { 
    res.redirect('/admin');
  } else { 
    res.render('admin/login', { loginErr: req.session.adminLoginErr }); 
    req.session.adminLoginErr = '';
  } 
});

router.post('/adminlogin', (req, res) => { 
  productHelpers.adminLogin(req.body).then((response) => { 
    if (response.status) { 
      req.session.admin = response.admin; 
      req.session.adminLoggedIn = true; 
      res.redirect('/admin'); 
    } else { 
      req.session.adminLoginErr = 'Please enter the correct admin email & password'; 
      res.redirect('/admin/adminlogin'); 
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.admin=null
  req.session.adminLoggedIn=false
  res.redirect('/admin')
})

router.get('/add-products', verifyAdmin, function (req, res, next) {
  let admin = req.session.admin
  res.render('admin/add-products', { admin, ad:true });
});

router.post('/admin/add-products', function (req, res) {
  productHelpers.addProduct(req.body, (id) => {
    if (req?.files?.img){
    let image = req.files.img;
    image.mv('./public/product-img/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.redirect('/admin/add-products')
      } else {
        console.log(err);
      }
    })
  }else{
    res.redirect('/admin/add-products')
  }
  })
});

router.get('/delete-product/:id', verifyAdmin, (req, res) => {
  let proId = req.params.id
  let proImg = './public/product-img/' + proId + '.jpg'
  productHelpers.deleteProduct(proId).then((resolve) => {
    if(proImg){
    fs.unlink(proImg, (err) => {
      if (!err) {
        res.redirect('/admin')
      }else{
        res.redirect('/admin')
      }
    })}
  })
});

router.get('/edit-product/:id', verifyAdmin, async (req, res) => {
  let admin = req.session.admin
  let product = await productHelpers.getProductDetails(req.params.id)
  let imgPath = '/product-img/' + req.params.id + '.jpg'
  res.render('admin/edit-product', { product, imgPath, admin, ad:true })
});

router.post('/edit-product/:id', (req, res) => {
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req?.files?.img) {
      let image = req.files.img;
      image.mv('./public/product-img/' + req.params.id + '.jpg')
    }
  })
});

module.exports = router;
