var express = require('express');
var router = express.Router();
// var productHelper=require('../helpers/product-helpers');
const productHelpers = require('../helpers/product-helpers');

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    console.log(products);
    res.render('admin/view-products',{admin:true,products})
  })
  
});
router.get('/add-product',function(req,res){
  res.render('admin/add-product');
})
router.post('/add-product',(req,res)=>{
  console.log(req.body);
  console.log(req.files?.image)
  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files?.image
    // console.log(id);
    image.mv('./public/product-images/'+id+'.jpg')
    res.render("admin/add-product");
    
  });
})
router.get('/delete-product/:id',(req,res)=>{
  let prodId=req.params.id
  console.log(prodId)
  productHelpers.deleteProduct(prodId).then((response)=>{
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id',async (req,res)=>{
  let product= await productHelpers.getProductDetails(req.params.id)
  console.log(product)
  res.render('admin/edit-product',{product})
})

router.post('/edit-product/:id',(req,res)=>{
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    let id=req.params.id
    res.redirect('/admin')
    if(req.files?.Image){
      let image=req.files?.Image
    // console.log(id);
      image.mv('./public/product-images/'+id+'.jpg')
    }
  })
})
module.exports = router;
