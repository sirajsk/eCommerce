var db = require('../config/connection')
var collection = require('../config/collecion')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectId
const { ObjectId } = require('bson')
// const { response } = require('express')
const moment = require('moment')


module.exports = {


    // category management start
    addCategory: (data) => {
        return new Promise(async (resolve, reject) => {

            let Cat = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: data.Name })

            if (Cat) {
                await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ category: data.Name }, { $push: { Scategory: data.Sname } })

                resolve()
            } else {
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne({ category: data.Name, Scategory: [data.Sname] }).then((response) => {

                    // console.log(response);

                    resolve(response)
                })
            }
        })

    },
    categoryDetailes: () => {
        return new Promise(async (resolve, reject) => {
            let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(categories)

        })
    },
    deleteCategory: (CaId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(CaId) }).then((response) => {
                resolve(response)
            })
        })

    },

    //    category management end


    // brand management start
    addBrand: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).insertOne(data).then((response) => {
                console.log(response);
                resolve(response.insertedId.toString())
            })
        })

    },
    getAllbrands: () => {
        return new Promise(async (resolve, reject) => {
            let brands = await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
            resolve(brands)
            console.log(brands);
        })
    },
    deleteBrand: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).deleteOne({ _id: objectId(proId) }).then((response) => {
                resolve(response)
            })
        })

    },
    BrandDetailes: (brandId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).findOne({ _id: ObjectId(brandId) }).then((brand) => {
                resolve(brand)
            })
        })

    },

    updateBrand: (brandId, BrandData) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).updateOne({ _id: ObjectId(brandId) }, {
                $set: {
                    Name: BrandData.Name
                }

            }).then((response) => {
                resolve(response)
            })
        })

    },

    //    brand management end

    // product management start


    addProduct: (proData) => {
        return new Promise((resolve, reject) => {
            proData.Price = parseInt(proData.Price)
            // proData.cost=parseInt(proData.cost)
            proData.Stock = parseInt(proData.Stock)
            // console.log(data);
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(proData).then((response) => {
                resolve(response.insertedId.toString())
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    getWomenProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let Wproducts=await db.get().collection(collection.PRODUCT_COLLECTION).find({Mcategory:"Women"}).toArray()
            console.log(Wproducts,'00000000');
            resolve(Wproducts)
        })
    },
    getMenProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let Mproducts=await db.get().collection(collection.PRODUCT_COLLECTION).find({Mcategory:"Men"}).toArray()
            console.log(Mproducts,'00000000');
            resolve(Mproducts)
        })
    },
    deleteProduct: (productid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(productid) }).then((response) => {
                resolve(response)
            })
        })

    },


    productDetail: (productid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(productid) }).then((product) => {


                resolve(product)
            })

        })
    },

    updateProduct: (prdtId, productData) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(prdtId) }, {
                $set: {

                    Name: productData.Name,
                    Stock: productData.Stock,
                    Discription: productData.Discription,
                    Brand: productData.Brand,
                    Mcategory: productData.Mcategory,
                    Size: productData.Size,
                    Colour: productData.Colour,
                    Price: productData.Price
                }
            }).then((response) => {
                resolve(response)

            })
        })

    },

    //    product management end
    // admin login start

    adminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let responseAdmin = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email })
            if (admin) {
                if (adminData.password == admin.password) {
                    responseAdmin.admin = admin
                    responseAdmin.status = true
                    resolve(responseAdmin)
                }
                else {
                    resolve({ status: false })
                }
            } else {
                resolve({ status: false })
            }
        })

    },
    // user managemnet
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let AllUsers = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(AllUsers)
        })
    },
    blockUser: (Id, userData) => {
        console.log('dfdjhfsdhfjdshfkdhf');
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(Id) },
                {
                    $set: {
                        status: false
                    }
                }).then((response) => {
                    resolve(response)
                    console.log(response, "res");
                })
        })
    },
    unblockUser: (Id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(Id) },
                {
                    $set: {
                        status: true
                    }
                }).then((response) => {
                    resolve(response)
                    console.log(response, "res");
                })
        })
    },
    getBlockedUsers: () => {
        return new Promise(async (resolve, reject) => {
            let blockedUsers = await db.get().collection(collection.USER_COLLECTION).find({ status: false }).toArray()
            resolve(blockedUsers)
        })

    },
    getOrderProducts: (orderId) => {
        console.log(orderId);
        return new Promise(async (resolve, reject) => {
            let orderItem = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(orderId)
                    }
                },
                {
                    $unwind: '$Products'
                },
                {
                    $project: {
                        item: '$Products.item',
                        qty: '$Products.qty'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'Products'

                    }
                },
                {
                    $project: {
                        item: 1, qty: 1, product: { $arrayElemAt: ['$Products', 0] },
                        // subtotal: { $multiply: [{ $arrayElemAt: ["$product.Price", 0] }, "$qty"] }


                    }

                }

            ]).toArray()
            console.log(orderItem, "0");
            resolve(orderItem)
        })
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(orders)
        })
    },
    changeOrderStatus: (orderId, stat) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    Status: stat
                }
            }).then(() => {
                resolve()
            })
        })
    },
    addBanner: (data) => {
        console.log(data)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).insertOne({ banner: "One", Name: data.Name, Discription: data.Discription, Action: data.Action }).then((response) => {
                console.log(response);
                resolve(response.insertedId.toString())
            })
        })

    },
    getAllbanner: () => {
        return new Promise(async (resolve, reject) => {
            let banners = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banners)
        })
    },
    getFirstAllbanner: () => {
        return new Promise(async (resolve, reject) => {
            let banners = await db.get().collection(collection.BANNER_COLLECTION).find({ banner: "One" }).toArray()
            resolve(banners)
        })
    },
    addSecondBanner: (data) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).insertOne({ banner: "Two", Name: data.Name, Discription: data.Discription, Action: data.Action }).then((response) => {
                console.log(response);
                resolve(response.insertedId.toString())
            })
        })
    },
    getSecondAllbanner: () => {
        return new Promise(async (resolve, reject) => {
            let banners = await db.get().collection(collection.BANNER_COLLECTION).find({ banner: "Two" }).toArray()
            resolve(banners)
        })
    },
    getUserCount: () => {

        return new Promise(async (resolve, reject) => {
            let UCount = await db.get().collection(collection.USER_COLLECTION).count()

            resolve(UCount)


        })
    },
    getProductCount: () => {
        return new Promise(async (resolve, reject) => {
            let Pcount = await db.get().collection(collection.PRODUCT_COLLECTION).count()
            resolve(Pcount)
        })

    },
    getProfite: () => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        Status: 'Delivered'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$Total' }
                    }
                }
            ]).toArray()

            resolve(total[0].total)
        })
    },
    latestProduct: () => {
        return new Promise(async (resolve, reject) => {
            let latestProduct = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({ $natural: -1 }).limit(5).toArray()

            resolve(latestProduct)
        })
    },
    latestOrders: () => {
        return new Promise(async (resolve, reject) => {
            let latestOrders = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ $natural: -1 }).limit(5).toArray()

            resolve(latestOrders)
        })
    },
    AllMethods: () => {
        let Methods = []
        return new Promise(async (resolve, reject) => {
            let CodProduct = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        PaymentMethod: 'COD'
                    }
                }
            ]).toArray()
            let CODlen = CodProduct.length
            Methods.push(CODlen)

            let PaypalProduct = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        PaymentMethod: 'Paypal'
                    }
                }
            ]).toArray()
            let PayPallen = PaypalProduct.length
            Methods.push(PayPallen)

            let RazorpayProduct = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        PaymentMethod: 'Razorpay'
                    }
                }
            ]).toArray()
            let Razorpaylen = RazorpayProduct.length
            Methods.push(Razorpaylen)

            resolve(Methods)





        })
    },
    OrderStatus: () => {

        let status = []
        return new Promise(async (resolve, reject) => {
            let Pending = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        Status: 'Pending'
                    }
                }
            ]).toArray()
            let Pendinglen = Pending.length
            status.push(Pendinglen)

            let Placed = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        Status: 'Placed'
                    }
                }
            ]).toArray()
            let Placedlen = Placed.length
            status.push(Placedlen)

            let Shipped = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        Status: 'Shipped'
                    }
                }
            ]).toArray()
            let Shippedlen = Shipped.length
            status.push(Shippedlen)


            let Delivered = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        Status: 'Delivered'
                    }
                }
            ]).toArray()
            let Deliveredlen = Delivered.length
            status.push(Deliveredlen)

            let Cancelled = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        Status: 'Cancelled'
                    }
                }
            ]).toArray()
            let Cancelledlen = Cancelled.length
            status.push(Cancelledlen)

            resolve(status)





        })

    },
    CategoryOffer: ((data) => {
        console.log(data);
        return new Promise(async (resolve, reject) => {
            cat = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Mcategory: data.Name }).toArray()
            console.log(cat, 'prod in cat');
            let len = cat.length
            let ofervalue = parseInt(data.Percentage)
            for (let i = 0; i < len; i++) {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(cat[i]._id) }, {
                    $set: {
                        Percentage: data.Percentage
                    }
                }).then(() => {
                    db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(cat[i]._id) }).then((proData) => {
                        if (proData.Percentage) {
                            if (proData.ActualPrice) {
                                let ActualPrice = proData.ActualPrice
                                let discountVal = ((ActualPrice * ofervalue) / 100).toFixed()
                                let offerPrice = (ActualPrice - discountVal)
                                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(cat[i]._id) }, {
                                    $set: {
                                        proOffer: true,
                                        ActualPrice: ActualPrice,
                                        Price: offerPrice
                                    }
                                }).then(() => {
                                     db.get().collection(collection.CATEGORY_OFFER).insertOne(data)
                                    resolve()
                                    if (data.Percentage == 0) {
                                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(cat[i]._id) }, {
                                            $unset: {
                                                ActualPrice: "",
                                                Percentage: ""
                                            }
                                        })
                                    }
                                })


                            } else {
                                let ActualPrice = proData.Price
                                let discountVal = ((ActualPrice * ofervalue) / 100).toFixed()
                                let offerPrice = (ActualPrice - discountVal)
                                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(cat[i]._id) }, {
                                    $set: {
                                        proOffer: true,
                                        ActualPrice: ActualPrice,
                                        Price: offerPrice
                                    }
                                }).then(() => {
                                    db.get().collection(collection.CATEGORY_OFFER).insertOne(data)
                                    resolve()
                                    if (data.Percentage == 0) {
                                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(cat[i]._id) }, {
                                            $unset: {
                                                ActualPrice: "",
                                                Percentage: ""
                                            }
                                        })
                                    }
                                })


                            }
                        }
                    })
                })
            }
            // db.get().collection(collection.CATEGORY_OFFER).insertOne(data)
            // resolve()
        })
    }),
    getCategoryOffer: () => {
        return new Promise(async (resolve, reject) => {
            Coffer = await db.get().collection(collection.CATEGORY_OFFER).find().toArray()
            resolve(Coffer)


        })
    },
    ProductOffer: ((data) => {
        console.log(data);
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Name: data.Name })
            console.log(product);
            data.Percentage = parseInt(data.Percentage)
            let ActualPrice = product.Price
            let newPrice = (((product.Price) * (data.Percentage)) / 100)
            newPrice = newPrice.toFixed()

            db.get().collection(collection.PRODUCT_OFFER).insertOne(data).then((response) => {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ Name: data.Name },
                    {
                        $set: {
                            proOffer: true,
                            Percentage: data.Percentage,
                            Price: (ActualPrice - newPrice),
                            ActualPrice: ActualPrice
                        }
                    }).then(() => {
                        resolve()
                    })
            })

        })
    }),
    getProductOffer: () => {
        return new Promise(async (resolve, reject) => {
            Poffer = await db.get().collection(collection.PRODUCT_OFFER).find().toArray()
            resolve(Poffer)


        })
    },
    updateUAddress: (AddId, data) => {
        console.log(data);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(AddId) }, {

                $set: {
                    name: data.name,
                    email: data.email,
                    mobile: data.mobile
                }


            }).then((response) => {
                resolve(response)
            })
        })
    },
    getSingleBanner: (bannerID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).findOne({ _id: objectId(bannerID) }).then((Banner) => {
                resolve(Banner)
            })

        })
    },
    updateBanner: (bannerId, data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
                .updateOne({ _id: objectId(bannerId) }, {
                    $set: {
                        Name: data.Name,
                        Discription: data.Discription,
                        Action: data.Action
                    }
                }).then((response) => {
                    resolve(response)
                })
        })
    },
    deleteBanner: (bannerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({ _id: objectId(bannerId) }).then(() => {
                resolve()
            })
        })
    },
    deleteoffer: (offerId) => {
        console.log(offerId);
        return new Promise(async (resolve, reject) => {

            let productOffer = await db.get().collection(collection.PRODUCT_OFFER).findOne({ _id: objectId(offerId) })

            let pname = productOffer.Name
            console.log(pname);
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Name: pname })

            console.log(product);

            db.get().collection(collection.PRODUCT_OFFER).deleteOne({ _id: objectId(offerId) }).then((response) => {

                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ Name: pname }, {
                    $set: {
                        Price: product.ActualPrice
                    },
                    $unset: {
                        proOffer: "",
                        Percentage: "",
                        ActualPrice: ""
                    }

                }).then(() => {

                    resolve()
                })
            })


        })
    },
    getCategory: (cId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectId(cId) }).then((Category) => {
                resolve(Category)
            })
        })
    },
    updateCategory: (Cid, data) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectId(Cid) }, {
                $set: {
                    category: data.Name

                }
            }).then((response) => {
                resolve(response)

            })
        })
    },
    

}


