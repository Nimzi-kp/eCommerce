var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/products-helpers');
var userHelpers = require('../helpers/user-helpers');
const { log } = require('handlebars');
const { ObjectId } = require('mongodb');


const verifyLogin = (req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/',async function (req, res) {
  let user = req.session.user
  let cartCount = 0;
  if(user){
    cartCount =await userHelpers.getCartCount(user._id)
  }
  productHelpers.getAllProduct().then((products) => {
    res.render('user/index', { products, user, cartCount,});
  });
});

router.get('/login', (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login',{loginErr:req.session.userLoginErr});
    req.session.userLoginErr='';
  }
});

router.get('/signup', (req, res) => {
  res.render('user/signup')
});

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    req.session.user = response.user
    req.session.userLoggedIn = true
    res.redirect('/')
  })
})

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    } else {
      req.session.userLoginErr='This Email or Password is invalid';
      res.redirect('/login'); 
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')
})

router.get('/profile',verifyLogin,(req,res)=>{
  let user = req.session.user
  res.render('user/profile',{user})
})

router.get('/cart',verifyLogin,async(req,res)=>{
  let user = req.session.user
  let products=await userHelpers.getCartProduct(user._id)
  let totalAmount = await userHelpers.getTotalAmount(user._id)
  res.render('user/cart',{user,products,totalAmount})
})

router.get('/is-logged-in', (req, res) => {
  if (req.session.userLoggedIn) {
      res.json({ loggedIn: true });
  } else {
      res.json({ loggedIn: false });
  }
});

router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  if(req.session.userLoggedIn){
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true,})
  })
  }else{
    res.redirect('/login')
  }
})

router.post('/change-product-quantity', (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user);
    console.log(response.total);
    res.json(response);
  });
});


router.post('/remove-from-cart', (req, res, next) => { 
  userHelpers.removeProductFromCart(req.body).then((response) => { 
    res.json(response); 
  })
})

router.get('/place-order',verifyLogin,async(req,res,next)=>{
  let user = req.session.user
  let totalAmount = await userHelpers.getTotalAmount(user._id)
  res.render('user/place-order',{totalAmount,user})
})

router.post('/place-order',async(req,res)=>{
  let products = await userHelpers.getCartProductList(req.body.userId)
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})
    }else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
      })
    }
  })
})

router.get('/orderSuccess',(req,res)=>{
  let user = req.session.user
  res.render('user/orderSuccess',{user})
})

router.get('/orders',verifyLogin,async(req,res)=>{
  let user = req.session.user
  let orders = await userHelpers.getOrderProduct(user._id)
  if (orders.length > 0) {
    res.render('user/orders', { user, orders });
} else {
    res.render('user/orders', { user, orders: [] });
}
})

router.get('/order-details/:orderId', verifyLogin, async (req, res) => {
  let user = req.session.user;
  let orderId = req.params.orderId;
  let orderDetails = await userHelpers.getOrderDetails(orderId);
  if (orderDetails && orderDetails.userId.toString() === user._id.toString()) {
    res.render('user/order-detail', { orderDetails, user });
  } else {
    res.redirect('/orders');
  }
});

router.post('/verify-payment',(req,res)=>{
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    res.json({status:'Payment failed'})
  })
})

module.exports = router;