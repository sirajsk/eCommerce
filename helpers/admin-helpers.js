var db = require('../config/connection')
var collection = require('../config/collecion')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectId
const { ObjectId } = require('bson')
// const { response } = require('express')


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
    BrandDetailes:(brandId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.BRAND_COLLECTION).findOne({_id:ObjectId(brandId)}).then((brand)=>{
                resolve(brand)
            })
        })

    },
    
    updateBrand:(brandId,BrandData)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.BRAND_COLLECTION).updateOne({_id:ObjectId(brandId)},{
                $set:{
                    Name:BrandData.Name
                }

            }).then((response)=>{
                resolve(response)
            })
        })

    },

    //    brand management end

    // product management start


    addProduct: (proData) => {
        return new Promise((resolve, reject) => {
            proData.Price=parseInt(proData.Price)
            // proData.cost=parseInt(proData.cost)
            proData.Stock=parseInt(proData.Stock)
            // console.log(data);
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(proData).then((response) => {
                resolve(response.insertedId.toString())
            }).catch((err)=>{
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

    updateProduct:(prdtId,productData )=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(prdtId)},{
                $set:{
                    
                    Name:productData.Name,
                    Stock:productData.Stock,
                    Discription:productData.Discription,
                    Brand:productData.Brand,
                    Mcategory:productData.Mcategory,
                    Size:productData.Size,
                    Colour:productData.Colour,
                    Price:productData.Price
                }
            }).then((response)=>{
                resolve(response)

            })
        })

    },

    //    product management end
    // admin login start

    adminLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let responseAdmin={}
            let admin =await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email})
            if(admin){
                if(adminData.password==admin.password){
                    responseAdmin.admin = admin
                    responseAdmin.status = true
                    resolve(responseAdmin)
                }
                else{
                    resolve({ status: false })
                }
            }else{
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
                        status:false
                    }
                }).then((response) => {
                    resolve(response)
                    console.log(response,"res");
                })
        })
    },
    unblockUser: (Id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(Id) },
                {
                    $set: {
                        status:true
                    }
                }).then((response) => {
                    resolve(response)
                    console.log(response,"res");
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
    
    
}


