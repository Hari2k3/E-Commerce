var db=require('../config/connection')
var collection=require('../config/collections')
const {ObjectId} =require('mongodb')
module.exports={
    addProduct:(product,callback)=>{
        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data);
            callback(data.insertedId)
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            if (!ObjectId.isValid(prodId)) {
                console.error(`Invalid ObjectId format: ${prodId}`);
                reject(new Error('Invalid ObjectId format'));
                return;
            }
    
            const objectId = new ObjectId(prodId);
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId }).then((response) => {
                console.log(response);
                resolve(response);
            }).catch((error) => {
                console.error(`Error deleting product with ObjectId ${prodId}: ${error.message}`);
                reject(error);
            });
        });
    },
    getProductDetails:(prodId)=>{
        return new Promise((resolve,reject)=>{
            const objectId = new ObjectId(prodId);
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            const objectId = new ObjectId(proId);
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId},{
                $set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    Price:proDetails.Price,
                    Category:proDetails.Category
                }
            }).then((response)=>{
                resolve()
            })
        })
    }
    
    
    
}

