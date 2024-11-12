var db = require('../config/connection')
var Collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require('express')
var ObjectId = require('mongodb').ObjectId

module.exports = {
    adminLogin:(userData) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(Collection.USER).findOne({ Email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.Password).then((status) => {
                    if (status && user.admin === 'true') {
                        resolve({ admin: user, status: true })
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: false })
            }
        })
    },
    addProduct: (product, callback) => {
        db.get().collection(Collection.PRODUCT).insertOne(product)
            .then((data) => {
                callback(data.insertedId)
            })
    },
    getAllProduct: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(Collection.PRODUCT).find().toArray();
            resolve(products);
        })
    },
    deleteProduct: (prodid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(Collection.PRODUCT).deleteOne({ _id: new ObjectId(prodid) }).then((response) => {
                resolve(response)
            })
        })
    },
    getProductDetails: (proid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(Collection.PRODUCT).findOne({ _id: new ObjectId(proid) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(Collection.PRODUCT).updateOne({ _id: new ObjectId(proId) }, {
                    $set: {
                        title: proDetails.title,
                        price: proDetails.price,
                        category: proDetails.category,
                        discription: proDetails.discription
                    }
                }).then((response) => {
                    resolve()
                })
        })
    }
}