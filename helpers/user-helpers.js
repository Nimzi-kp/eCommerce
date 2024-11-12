var db = require('../config/connection')
var Collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require('express')
const { reject, promise } = require('bcrypt/promises')
var ObjectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: 'rzp_test_lvGWMBpENteAe2',
  key_secret: 'tH4vJwFji3WLnDms9bT9sPyL',
});

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            userData.Password = await bcrypt.hash(userData.Password, 10)
            userData.ConformPassword = await bcrypt.hash(userData.Password, 10)
            db.get().collection(Collection.USER).insertOne(userData)
                .then((data) => {
                    response.user = userData
                    resolve(response)
                })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(Collection.USER).findOne({ Email: userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        response.user = user;
                        response.status = true
                        resolve(response)
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: false })
            }
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: new ObjectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(Collection.CART).findOne({ user: new ObjectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                if (proExist != -1) {
                    db.get().collection(Collection.CART).updateOne(
                        { user: new ObjectId(userId), 'products.item': new ObjectId(proId) },
                        { $inc: { 'products.$.quantity': 1 } }
                    ).then((response) => {
                        resolve()
                    })
                } else {
                    db.get().collection(Collection.CART).updateOne(
                        { user: new ObjectId(userId) },
                        { $push: { products: proObj } }
                    ).then((response) => {
                        resolve()
                    })
                }
            } else {
                let cartObj = {
                    user: new ObjectId(userId),
                    products: [proObj]
                }
                db.get().collection(Collection.CART).insertOne(cartObj).then((response) => {
                    resolve();
                })
            }
        })
    },
    getCartProduct: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(Collection.CART).aggregate([
                {
                    $match: { user: new ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: Collection.PRODUCT,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(Collection.CART).findOne({ user: new ObjectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: (data) => {
        let quantity = parseInt(data.quantity)
        let count = parseInt(data.count)
        return new Promise((resolve, reject) => {
            if (data.count == -1 && quantity == 1) {
                resolve({ remove: true })
            } else {
                db.get().collection(Collection.CART).updateOne(
                    { _id: new ObjectId(data.cart), 'products.item': new ObjectId(data.product) },
                    { $inc: { 'products.$.quantity': count } }
                ).then((response) => {
                    resolve({ success: true });
                })
            }
        })
    },
    removeProductFromCart: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(Collection.CART).updateOne(
                { _id: new ObjectId(data.cart) },
                { $pull: { products: { item: new ObjectId(data.product) } } }
            ).then((response) => {
                resolve({ success: true })
            });
        });
    },
    getTotalAmount: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(Collection.CART).aggregate([
                {
                    $match: { user: new ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $lookup: {
                        from: Collection.PRODUCT,
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$products.quantity', { $toDecimal: '$product.price' }] } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        total: { $toDouble: "$total" }
                    }
                }
            ]).toArray()
                .then(total => {
                    let totalAmount = total.length > 0 ? parseFloat(total[0].total) : 0;
                    resolve(totalAmount);
                })
        });
    },
    placeOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            let status = order['payment-method']==='COD'?'plased':'pending'
            let orderObj={
                deliveryDetails:{
                    mobile:order.mobile,
                    address:order.address,
                    pincode:order.pincode
                },
                userId:new ObjectId(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                totalAmount:total,
                status:status,
                date:new Date()
            }
            db.get().collection(Collection.ORDER).insertOne(orderObj).then((response)=>{
                db.get().collection(Collection.CART).deleteMany({user:new ObjectId(order.userId)})
                console.log()
                resolve(response.insertedId)
            })
        })
    },
    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart = await db.get().collection(Collection.CART).findOne({user:new ObjectId(userId)})
            resolve(cart.products)
        })
    },
    getOrderProduct: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(Collection.ORDER).aggregate([
                {
                  $match: { userId: new ObjectId(userId) }
                },
                {
                  $project: {
                    date: { $dateToString: { format: "%d/%m/%Y", date: "$date" } },
                    id: "$_id",
                    amount: "$totalAmount",
                    status: 1
                  }
                }
              ]).toArray();
              resolve(orderItems);
        })              
    },
    getOrderDetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
          try {
            let order = await db.get().collection(Collection.ORDER).findOne({ _id: new ObjectId(orderId) });
    
            if (order) {
              let orderProducts = await db.get().collection(Collection.PRODUCT).find({
                _id: { $in: order.products.map(product => product.item) }
              }).toArray();
              let detailedProducts = order.products.map(product => {
                let productDetails = orderProducts.find(p => p._id.toString() === product.item.toString());
                return {
                  ...product,
                  item: productDetails
                };
              });
              resolve({
                ...order,
                products: detailedProducts,
              });
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        });
    },
      generateRazorpay:(orderId,total)=>{
        return new promise((resolve,reject)=>{
            instance.orders.create({
                amount: total*100,
                currency: "INR",
                receipt: ""+orderId,
                notes: {
                    key1: "first value",
                    key2: "second value"
                }
            },(err,order)=>{
                resolve(order)
            })
        })
    },
    verifyPayment:(details)=>{
        return new promise((resolve,reject)=>{
            const crypto = require('node:crypto');
            let hmac = crypto.createHmac('sha256', 'tH4vJwFji3WLnDms9bT9sPyL')
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
            hmac=hmac.digest('hex')
            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })
    },
    changePaymentStatus:(orderId)=>{
        return new promise((resolve,reject)=>{
            db.get().collection(Collection.ORDER).updateOne({_id:new ObjectId(orderId)},
            {
                $set:{
                    status:'placed'
                }
            }
        ).then(()=>{
            resolve()
        })
        })
    }
}