var db=require('../config/connection')
var collection=require('../config/collections')
var bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('express')
module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{

            userData.Password=await bcrypt.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                // console.log(userData)
                resolve(userData)
            })
    })
    
    },
    doLogin:(userData)=>{
        return new Promise(async (resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status){
                        console.log("login successful");
                        response.user=user
                        response.status=true
                        resolve(response)
                    }else{
                        console.log('login failed');
                        resolve({status:false})
                    }
                })
            }else{
                console.loglog('login failed');
                resolve({status:false})
            }
        })    
    },
    addToCart:(proId,userId)=>{
        let proObj={
            item:new ObjectId(proId),
            quantity:1
        }
        return new Promise(async (resolve,reject)=>{
            const objectId = new ObjectId(userId);
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId})
            if(userCart){
                let proExist=userCart.products.findIndex(product=> product.item==proId)
                console.log(proExist);
                if(proExist!=-1){
                    let prodId = new ObjectId(proId);
                    let uId = new ObjectId(userId);
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:uId,'products.item': prodId},
                    {
                        $inc:{'products.$.quantity':1} 
                    }
                    ).then(()=>{
                        resolve()
                    })
                }else{
                db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId},
                    {
                        $push:{products:proObj}
                    }).then((response)=>{
                        resolve()
                    })
                }
            }else{
                let cartObj={
                    user:objectId,
                    products:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })           
    },
    getCartProducts:(userId)=>{
        return new Promise(async (resolve,reject)=>{
            const objectId = new ObjectId(userId);
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([{
                $match:{user:objectId}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                }
            
            }
            ]).toArray()
            // console.log(cartItems[0].product);
            resolve(cartItems)
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async (resolve,reject)=>{
            const objectId = new ObjectId(userId);
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId})
            if(cart){
                count=cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity:(details)=>{
        details.count=parseInt(details.count);
        details.quantity=parseInt(details.quantity);
        return new Promise(async (resolve,reject)=>{
            let prodId = new ObjectId(details.product);
            let cartId=new ObjectId(details.cart);
            if(details.count==-1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTION).updateOne({_id:cartId},
                    {
                        $pull:{products:{item:prodId}}
                    }
                ).then((response)=>{
                    resolve({removeProduct:true})
                })
            }else{
                db.get().collection(collection.CART_COLLECTION).updateOne({_id:cartId,'products.item': prodId},
                    {
                        $inc:{'products.$.quantity':details.count} 
                    }
                    ).then((response)=>{
                        resolve({status:true})
                    })
            }
        })
    },
    getTotalAmount:(userId)=>{
        return new Promise(async (resolve,reject)=>{
            const objectId = new ObjectId(userId);
            let total=await db.get().collection(collection.CART_COLLECTION).aggregate([{
                $match:{user:objectId}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                }
            
            },
            {
                $group:{
                    _id:null,
                    total:{$sum:{$multiply:[{$toDouble:'$quantity'},{$toDouble:'$product.Price'}]}}
                }
            }
            ]).toArray()
            console.log(total[0].total);
            resolve(total[0].total)
        })
    },
    placeOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            console.log(order,products,total);
            let status=order['payment-method']==='COD'?'placed':'pending';
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
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:new ObjectId(order.userId)})
                resolve()
            })
        })
    },
    getCartProductList:(userId)=>{
        const uId=new ObjectId(userId)
        return new Promise(async (resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:uId})
            resolve(cart.products)
        })
    },
    getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collection.ORDER_COLLECTION).find({userId:new ObjectId(userId)}).toArray()
            resolve(orders)
        })
    },
    getOrderProducts:(orderId)=>{
        return new Promise(async (resolve,reject)=>{
            const objectId = new ObjectId(orderId);
            let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                $match:{user:objectId}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                }
            
            }
            ]).toArray()
            // console.log(cartItems[0].product);
            resolve(orderItems)
        })
    }
    
}
