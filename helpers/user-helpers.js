var db = require('../config/connection')
var collection = require('../config/collecion')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectId
const { response } = require('express')
const moment = require('moment')
var Razorpay = require('razorpay')
const { resolve } = require('path')

var instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret
});

module.exports = {
    dosignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            console.log(userData);
            userData.password = await bcrypt.hash(userData.password, 10)
            user = {
                name: userData.name,
                email: userData.email,
                mobile: `+91${userData.mobile}`,
                password: userData.password,
                status: true
            }
            db.get().collection(collection.USER_COLLECTION).insertOne(user).then((data) => {
                resolve(user)
                console.log(user);
            })
        })
    },
    dologin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = true
            Umobile=`+91${userData.mobile}`
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: Umobile })
            if (user) {
                // console.log('test');
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log('login success');
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                })

            } else {
                console.log('failed');
                resolve({ status: false })
            }
        })
    },
    getUserdetails: (mobile1) => {
        
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: mobile1 })
            resolve(user)
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            qty: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTIONS).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.product.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTIONS).updateOne({ user: objectId(userId), 'product.item': objectId(proId) },
                        {
                            $inc: { 'product.$.qty': 1 }
                        }).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTIONS).updateOne({ user: objectId(userId) },
                        {
                            $push: { product: proObj }
                        }).then((response) => {
                            resolve()
                        })
                }

            } else {
                let cartObj = {
                    user: objectId(userId),
                    product: [proObj]
                }
                db.get().collection(collection.CART_COLLECTIONS).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    addToWish:(proId,userId)=>{
     
        let proObj={
            
            item:objectId(proId)
        }
        console.log(userId,'----------------');
        return new Promise(async(resolve,reject)=>{
            let userwishList=await db.get().collection(collection.WISH_LIST).findOne({user:objectId(userId)})
            console.log(userwishList);
            if(userwishList){
                let proExist = userwishList.product.findIndex(product => product.item == proId)
                if(proExist !=-1){
                    db.get().collection(collection.WISH_LIST).updateOne({user:objectId(userId)},

                    {
                        $pull:{
                            product:{item:objectId(proId)}
                        }
                    }).then(()=>{
                        console.log(response,'delete');
                        resolve()
                    })
                   
                }else{
                    db.get().collection(collection.WISH_LIST).updateOne({user:objectId(userId)},
                    
                    {
                        $push:{product:proObj}
                    }).then((response)=>{
                        resolve()
                    })
                   
                }
            








                // proexist=await db.get().collection(collection.WISH_LIST).findOne({item:objectId(proId)})
                // console.log(proexist,'proexist  ');
                // if(proexist){

                //     db.get().collection(collection.WISH_LIST).deleteOne({item:objectId(proId)}).then((response)=>{
                //         console.log(response,'delete');
                //         resolve()
                //     })

                // }else{
                //     db.get().collection(collection.WISH_LIST).insertOne(proObj).then((response)=>{
                //         resolve()
                //     })
                // } 
            }else{

                let wishobj={
                    user:objectId(userId),
                    product:[proObj]

                }



                db.get().collection(collection.WISH_LIST).insertOne(wishobj).then((response)=>{
                    resolve()
                })
            }
        })

    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTIONS).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        qty: '$product.qty'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },
                {
                    $project: {
                        item: 1,
                        qty: 1,
                        product: { $arrayElemAt: ['$product', 0] },
                        subtotal: { $multiply: [{ $arrayElemAt: ["$product.Price", 0] }, "$qty"] }

                    }
                }




            ]).toArray()
            // console.log(cartItems,'cartitems');

            resolve(cartItems)
        })

    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {

            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTIONS).findOne({ user: objectId(userId) })
            if (cart) {

                count = cart.product.length
                console.log(count);
            } else {
                console.log('test');
            }

            resolve(count)
        })

    },
    changeProductCount: (detailes) => {
        count = parseInt(detailes.count)
        qty = parseInt(detailes.qty)
        // console.log(detailes.qty);
        return new Promise((resolve, reject) => {
            if (detailes.count == -1 && detailes.qty == 1) {
                resolve({ removeProduct: true })
            } else {
                db.get().collection(collection.CART_COLLECTIONS)
                    .updateOne({ _id: objectId(detailes.cart), 'product.item': objectId(detailes.product) },
                        {
                            $inc: { 'product.$.qty': count }
                        }).then((response) => {
                            resolve({ response: true })
                        })
            }

        })
    },
    deleteCartProduct: (deatailes) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTIONS).updateOne(
                { _id: objectId(deatailes.cartId) },
                {
                    $pull: { product: { item: objectId(deatailes.proId) } }
                }).then((response) => {

                    resolve({ removeProduct: true })
                })
        })
    },
    singleProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            let SD = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
                .then((response) => {
                    resolve(response)
                })
        })
    },

    getSubTotal: (userId, proId) => {
        console.log(proId,'PROID');
        return new Promise(async (resolve, reject) => {
            let subtotal = await db.get().collection(collection.CART_COLLECTIONS).aggregate([
                {
                    $match: {
                        user: objectId(userId)
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        qty: '$product.qty'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },
                {
                    $match: {
                        item: objectId(proId)
                    }
                },
                {
                    $project: {
                        item: 1, qty: 1, product: { $arrayElemAt: ['$product', 0] }

                    }


                },
                {
                    $project: {
                        unitPrice: { $toInt: '$product.Price' },
                        quantity: { $toInt: '$qty' }
                    }
                },
                {
                    $project: {
                        _id: null,

                        subtotal: { $sum: { $multiply: ['$quantity', '$unitPrice'] } }
                    }
                }

            ]).toArray()
            // console.log(item);
            console.log(subtotal, "in u");
            if (subtotal.length > 0) {
                resolve(subtotal[0].subtotal)
            }
            else {
                subtotal = 0
                resolve(subtotal)
            }


        })
    },
    
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let totals = await db.get().collection(collection.CART_COLLECTIONS).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        qty: '$product.qty'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },
                {
                    $project: {
                        item: 1,
                        qty: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: [{ '$toInt': '$qty' }, { '$toInt': '$product.Price' }] } }
                    }
                }




            ]).toArray()


            resolve(totals[0]?.total)

        })

    },
    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {

            let Status = order.Payment === 'COD' ? 'Placed' : 'Pending'
            let dateIso = new Date()
            let date = moment(dateIso).format('YYYY/MM/DD')
            let time = moment(dateIso).format('HH:mm:ss')
            let orderObj = {
                deliveryDetails: {
                    FirstName: order.FirstName,
                    LastName: order.LastName,
                    House: order.House,
                    Street: order.Street,
                    Town: order.Town,
                    PIN: order.PIN,
                    Mobile: order.Mobile
                },
                // Email: order.Email,
                User: order.User,
                PaymentMethod: order.Payment,
                Products: products,
                Total: total,
                // Discount: order.Discount,
                Date: date,
                Time: time,
                Status: Status

            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                // db.get().collection(collection.CART_COLLECTIONS).deleteOne({ user: objectId(order.User) })

                resolve(response.insertedId.toString())
            })

        })

    },
    clearCart:(userId)=>{

        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTIONS).deleteOne({ user: objectId(userId) })
            resolve( )
        })

    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTIONS).findOne({ user: objectId(userId) })
            console.log(cart);
            resolve(cart.product)
        })
    },
    addNewAddress: (details) => {
        // console.log(details);

        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(details.User) })
            details._id = objectId()
            if (user.address) {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(details.User) }, {
                    $push: {
                        address: details
                    }
                }).then(() => {
                    resolve()
                })
            } else {
                console.log('on else');

                addr = [details]
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(details.User) }, {
                    $set: {
                        address: addr
                    }
                }).then((user) => {
                    resolve(user)
                })
            }

        })
    },
    addressChecker: (userId) => {
        return new Promise(async (resolve, reject) => {
            let status = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
            if (user.address) {
                status.address = true
            }
            resolve(status)
        })
    },
    getUserAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
            let address = user.address
            resolve(address)
        })
    },
    deleteAddress: (userId,id) => {
        console.log(userId,'userId');
        console.log(id,'proId');
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
            console.log(user);
            if (user.address) {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                    $pull: {
                        address: {_id:objectId(id)}
                    }
                }).then(() => {
                    resolve()
                })
            }
        })
    },
    getUserOrders: (Id) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ User: Id }).sort({ Date: -1 }).toArray()
            console.log(orders);

            resolve(orders)
        })
    },
    // stockChanger: (orderId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let prod = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
    //             {
    //                 $match: {
    //                     _id: objectId(orderId)
    //                 }
    //             },
    //             {
    //                 $unwind: '$product'
    //             },
    //             {
    //                 $project: {
    //                     item: '$product.item',
    //                     quantity: '$product.qty'
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: collection.PRODUCT_COLLECTION,
    //                     localField: 'item',
    //                     foreignField: '_id',
    //                     as: 'product'
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] },
    //                     newQty: { $subtract: [{ $arrayElemAt: ['$product.stock', 0] }, '$qty'] }
    //                 }
    //             }
    //         ]).toArray()
    //         let proLen = prod.length
    //         console.log('stockchange', prod);
    //         for (let i = 0; i < proLen; i++) {
    //             let itemMain = prod[i]
    //             db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(itemMain.item) }, {
    //                 $set: {
    //                     stock: itemMain.newQty
    //                 }
    //             })
    //             if (itemMain.newQty < 1) {
    //                 db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(itemMain.item) }, {
    //                     $set: {
    //                         stockout: true
    //                     }
    //                 })
    //             } else {
    //                 db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(itemMain.item) }, {
    //                     $unset: {
    //                         stockout: ""
    //                     }
    //                 })
    //             }
    //         }
    //         resolve()
    //     })
    // },
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId,
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            }
            instance.orders.create(options, (err, order) => {
                resolve(order)
            })
        })
    },
    verifyPayment: (detailes) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac("sha256",  process.env.key_secret)
            hmac.update(detailes['payment[razorpay_order_id]'] + '|' + detailes['payment[razorpay_payment_id]']);
            hmac = hmac.digest("hex");

            if (hmac == detailes['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }

        })

    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId) },
                    {
                        $set: {
                            Status: 'placed'
                        }
                    }
                ).then((response) => {
                    resolve(response)
                })
        })

    },
    userProfile: (userId) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
                .then((response) => {
                    resolve(response)
                })

        })
    },
    // singleAddress: (userId, aId) => {

    //     return new Promise((resolve, reject) => {
    //         user = db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then(() => {

    //             if (user) {
    //                 db.get().collection(collection.USER_COLLECTION).findOne({ address: { $elemMatch: { _id: objectId(aId) } } }).then((address) => {
    //                     resolve(address.address[0])
    //                 })
    //             }

    //         })

    //     })
    // },
    singleAddress:(userId,aId)=>{
        return new Promise(async(resolve,reject)=>{
            user=await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match:{
                        _id:objectId(userId)
                    },
                    
                },
                {
                    $unwind:"$address"

                },
                {
                    $match:{
                        "address._id":objectId(aId)
                    }
                },
                {
                    $project:{
                        address:1,
                        _id:0
                    }
                },

            ]).toArray()
            console.log(user);
            resolve(user)
        })
           
       
    },
    updateAddress: (aId, AddData, userId) => {
        return new Promise((resolve, reject) => {
            user = db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then(() => {
                if (user) {
                    db.get().collection(collection.USER_COLLECTION).updateOne({ address: { $elemMatch: { _id: objectId(aId) } } }, {
                        $set: {
                            "address.$.FirstName": AddData.FirstName,
                            "address.$.LastName": AddData.LastName,
                            "address.$.House": AddData.House,
                           "address.$.Street": AddData.Street,
                           "address.$.Town": AddData.Town,
                            "address.$.PIN": AddData.PIN

                        }
                    }).then((resp) => {
                        resolve(resp)
                    })
                }
            })
        })
    },
    changeAddress:(userId)=>{
        return new Promise((resolve,reject)=>{
            user=db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)}).then((user)=>{
                resolve(user)
            })
           
        })
    },
    getSingleProduct:(pId)=>{
        console.log(pId,'---------------------------------------------------------------------------------------');
        return new Promise(async(resolve,reject)=>{
            let product= await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(pId)}).then((product)=>{
                resolve(product)
            })
           
        })
    },
    SingleOrderPlace: (order, products, total) => {
        return new Promise((resolve, reject) => {

            let Status = order.Payment === 'COD' ? 'Placed' : 'Pending'
            let dateIso = new Date()
            let date = moment(dateIso).format('YYYY/MM/DD')
            let time = moment(dateIso).format('HH:mm:ss')
            let orderObj = {
                deliveryDetails: {
                    FirstName: order.FirstName,
                    LastName: order.LastName,
                    House: order.House,
                    Street: order.Street,
                    Town: order.Town,
                    PIN: order.PIN,
                    Mobile: order.Mobile
                },
                // Email: order.Email,
                User: order.User,
                PaymentMethod: order.Payment,
                Products: products,
                Total: total,
                // Discount: order.Discount,
                Date: date,
                Time: time,
                Status: Status

            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
               
                
                resolve(response.insertedId.toString())
            })

        })

    },
    // getWishCount:(userId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let count=0
    //         let Wishlist=await db.get().collection(collection.WISH_LIST).findOne({user:objectId(userId)})
    //         if(Wishlist){
    //             count=
    //         }
    //     })
    // },
    // getWishListPro:(userId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //        products=await  db.get().collection(collection.WISH_LIST).find({user:userId}).toArray()
    //        resolve(products)

    //     })
    // }
    
    getWishListPro: (userId) => {
        return new Promise(async (resolve, reject) => {
            let WishlistItem = await db.get().collection(collection.WISH_LIST).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        // qty: '$product.qty'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },
                {
                    $project: {
                        item: 1,
                        // qty: 1,
                        product: { $arrayElemAt: ['$product', 0] },

                    }
                }




            ]).toArray()
            // console.log(cartItems[0].product);

            resolve(WishlistItem)
        })

    },
    couponValidate:(Cdata)=>{
        console.log(Cdata);
        return new Promise(async(resolve,reject)=>{
            data={}
            let date=new Date()
            date=moment(date).format('DD/MM/YYYY')
            let coupon=await db.get().collection(collection.COUPON_OFFER).findOne({coupon:Cdata.couponCode})
            console.log(coupon);
            if(coupon){
                if(date<=coupon.EndDate){
                    if(coupon.status==1){
                        let total=parseInt(Cdata.Total)
                        let Percentage=parseInt(coupon.Percentage)
                        let discountVal=((total*Percentage)/100).toFixed()
                        data.total=total-discountVal
                        data.success=true
                        resolve(data)
                        db.get().collection(collection.COUPON_OFFER).updateOne({coupon:Cdata.couponCode},{
                            $set:{
                                status:0
                            }
                        })
                    }else{
                        data.couponUsed=true
                        resolve(data)
                    }
                }else{
                    data.couponExpired=true
                    resolve(data)

                }
            }else{
                data.invalidCoupon=true
                resolve(data)
            }

        })
    },

    deletewishProduct: (deatailes) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISH_LIST).updateOne(
                { _id: objectId(deatailes.wishId) },
                {
                    $pull: { product: { item: objectId(deatailes.proId) } }
                }).then((response) => {

                    resolve({ removeProduct: true })
                })
        })
    }




}