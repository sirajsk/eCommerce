const { response } = require('express');
var express = require('express');
var router = express.Router();
var adminHelper = require('../helpers/admin-helpers')
var fs = require('fs')

/* GET users listing. */

const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminloggedIn) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}
// admin basic start
router.get('/', async function (req, res, next) {
  if (req.session.adminloggedIn) {

    let userCount = await adminHelper.getUserCount()
    let productCount = await adminHelper.getProductCount()
    let Profite = await adminHelper.getProfite()
    let latestProduct = await adminHelper.latestProduct()
    let latestOrders = await adminHelper.latestOrders()

    let AllMethods = await adminHelper.AllMethods()
    let OrderStatus = await adminHelper.OrderStatus()

    console.log(AllMethods);

    console.log(OrderStatus);




    res.render('admin/dashboard', { admin: true, userCount, productCount, Profite, latestProduct, latestOrders, AllMethods, OrderStatus })

  } else {
    res.redirect('/admin/login')
  }


});
router.get('/login', function (req, res, next) {

  if (req.session.adminloggedIn) {

    res.redirect('/admin')
  }
  else {
    res.render('admin/admin-login', { admin: true, login: true, "loginErr": req.session.loggedInErr })
    req.session.loggedInErr = false
  }


});
router.post('/login', function (req, res, next) {
  adminHelper.adminLogin(req.body).then((responseAdmin) => {
    if (responseAdmin.status) {
      req.session.admin = responseAdmin.admin
      req.session.adminloggedIn = true
      res.redirect('/admin')
    } else {
      req.session.loggedInErr = true
      res.redirect('/admin/login')
    }
  })

});

// admin basic end

// product management start
router.get('/product-management', function (req, res, next) {

  res.render('admin/product-management', { admin: true })
});
router.get('/add-product', verifyAdminLogin, async function (req, res, next) {

  let brands = await adminHelper.getAllbrands()
  let categories = await adminHelper.categoryDetailes()
  res.render('admin/add-product', { admin: true, brands, categories, "proExist": req.session.proExist })
  req.session.proExist = false
});

router.post('/add-product', function (req, res, next) {

  adminHelper.addProduct(req.body).then((id) => {
    let image1 = req.files.image1
    let image2 = req.files.image2
    let image3 = req.files.image3


    image1.mv('public/product-images/' + id + 'a.jpg')
    image2.mv('public/product-images/' + id + 'b.jpg')
    image3.mv('public/product-images/' + id + 'c.jpg')

    res.redirect('/admin/view-products')

  }).catch((err) => {
    console.log(err);
    if (err.code == 11000) {
      req.session.proExist = true
      res.redirect('/admin/add-product')
    }
  })

});

router.get('/view-products', function (req, res, next) {
  adminHelper.getAllProducts().then((products) => {



    res.render('admin/view-products', { admin: true, products })
  })


});

router.get('/delete-product/:id', (req, res) => {
  let productid = req.params.id

  adminHelper.deleteProduct(productid).then((response) => {
    fs.unlinkSync('public/product-images/' + productid + 'b.jpg')
    fs.unlinkSync('public/product-images/' + productid + 'c.jpg')
    fs.unlinkSync('public/product-images/' + productid + 'a.jpg')


    res.redirect('/admin/view-products')
  })


})
router.get('/edit-product/:id', async (req, res) => {
  let categories = await adminHelper.categoryDetailes()
  let brand = await adminHelper.getAllbrands()
  console.log(categories, brand);
  adminHelper.productDetail(req.params.id).then((product) => {

    console.log(product, 'prod');
    res.render('admin/edit-product', { admin: true, categories, brand, product })
    console.log('ok');
  })
})

// product management end

// users start

router.get('/view-users', async function (req, res, next) {

  let AllUsers = await adminHelper.getAllUsers()

  res.render('admin/view-users', { admin: true, AllUsers })
});

router.get('/block-user/:id', (req, res) => {
  let id = req.params.id
  adminHelper.blockUser(id).then((response) => {
    console.log('djffdfgjhfdhgfd');
    res.redirect('/admin/view-users')
  })

})
router.get('/unblock-user/:id', (req, res) => {
  let id = req.params.id


  adminHelper.unblockUser(id).then((response) => {
    res.redirect('/admin/view-users')
  })

})
router.get('/blocked-users', function (req, res, next) {
  adminHelper.getBlockedUsers().then((blockedUsers) => {


    res.render('admin/blocked-users', { admin: true, blockedUsers })
  })

});
router.get('/unblock/:id', (req, res) => {
  let id = req.params.id


  adminHelper.unblockUser(id).then((response) => {
    res.redirect('/admin/blocked-users')
  })

})





// users end

// brand management start
router.get('/view-brand', async function (req, res) {
  adminHelper.getAllbrands().then((brands) => {



    res.render('admin/view-brand', { admin: true, brands })
  })



});

router.get('/add-brand', function (req, res, next) {

  res.render('admin/add-brand', { admin: true })
});

router.post('/add-brand', function (req, res, next) {
  console.log(req.body);
  console.log(req.files.Image);

  adminHelper.addBrand(req.body).then((id) => {
    // alert('sk')
    //  console.log(response);
    let image = req.files.image1
    image.mv('public/brand-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.redirect('/admin/view-brand')
      }
      else {
        res.redirect('/admin/add-brand')
      }
    })
  })

});

router.get('/delete-brand/:id', (req, res) => {

  let proId = req.params.id
  adminHelper.deleteBrand(proId).then(response)
  res.redirect('/admin/view-brand')
});


// brand management over





// category management

router.get('/view-category', function (req, res, next) {
  adminHelper.categoryDetailes().then((categories) => {
    // console.log(categories);
    res.render('admin/view-category', { admin: true, categories })
  })


});
router.get('/add-category', function (req, res, next) {

  res.render('admin/add-category', { admin: true })
});
router.post('/add-category', function (req, res, next) {

  adminHelper.addCategory(req.body).then((response) => {
    // console.log(req.body);
  })

  res.redirect('/admin/view-category')
});
router.get('/delete-category/:id', (req, res) => {

  let CaId = req.params.id
  adminHelper.deleteCategory(CaId).then(response)
  res.redirect('/admin/view-category')
});
router.get('/logout', (req, res) => {
  req.session.admin = null
  req.session.adminloggedIn = false
  res.redirect('/admin/login')
})
// category management over

module.exports = router;


// update check

router.post('/edit-product/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  adminHelper.updateProduct(id, req.body)

  console.log(req.body);
  res.redirect('/admin/view-products')
  if (req.files.image1) {
    let image1 = req.files.image1
    image1.mv('public/product-images/' + id + 'a.jpg')
  }
  if (req.files.image2) {
    let image2 = req.files.image2
    image2.mv('public/product-images/' + id + 'b.jpg')
  }
  if (req.files.image3) {
    let image3 = req.files.image3

    image3.mv('public/product-images/' + id + 'c.jpg')
  }
})
router.get('/edit-brand/:id', verifyAdminLogin, async (req, res) => {
  let brandId = req.params.id
  let brand = await adminHelper.BrandDetailes(brandId)
  res.render('admin/edit-brand', { admin: true, brand })
})
router.post('/edit-brand/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  

  adminHelper.updateBrand(id, req.body)
  res.redirect('/admin/view-brand')
    console.log(response);
    
    if (req.files.Image) {
      let imageA = req.files.Image
      imageA.mv('public/brand-images/' + id + '.jpg')
    }

   
  

  // }
})

router.get('/orders', verifyAdminLogin, async (req, res) => {
  let ordersList = await adminHelper.getAllOrders()
  console.log(ordersList);
  res.render('admin/all-orders', { admin: true, ordersList })
})

router.get('/singleOrder/:id', (req, res) => {
  let oId = req.params.id
  adminHelper.getOrderProducts(oId).then((products) => {
    console.log(products);
    res.render('admin/single-order', { products, admin: true })
  })
})


router.get('/placed/:id', (req, res) => {
  status = 'Placed'
  adminHelper.changeOrderStatus(req.params.id, status).then(() => {
    res.redirect('/admin/orders')
  })
})
router.get('/shipped/:id', (req, res) => {
  status = 'Shipped'
  adminHelper.changeOrderStatus(req.params.id, status).then(() => {
    res.redirect('/admin/orders')
  })
})
router.get('/delivered/:id', (req, res) => {
  status = 'Delivered'
  adminHelper.changeOrderStatus(req.params.id, status).then(() => {
    res.redirect('/admin/orders')
  })
})
router.get('/cancelled/:id', (req, res) => {
  
  status = 'Cancelled'
  adminHelper.changeOrderStatus(req.params.id, status).then(() => {
    res.redirect('/admin/orders')
  })
})
router.get('/banner-management', async (req, res) => {
  banner = await adminHelper.getAllbanner()
  res.render('admin/banner-management', { admin: true, banner })
})
router.get('/add-Banner', (req, res) => {

  res.render('admin/add-banner', { admin: true })

})
router.post('/add-banner', (req, res) => {
  adminHelper.addBanner(req.body).then((id) => {
    console.log(req.files);
    let image = req.files.Image1
    image.mv('public/banner/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.redirect('/admin/banner-management')
      }
      else {
        res.redirect('/admin/add-banner')
      }
    })
  })

})
router.get('/add-Second-Banner', (req, res) => {

  res.render('admin/add-second-banner', { admin: true })
})
router.post('/add-second-banner', (req, res) => {
  adminHelper.addSecondBanner(req.body).then((id) => {
    console.log(req.files);
    let image = req.files.Image1
    image.mv('public/banner/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.redirect('/admin/banner-management')
      }
      else {
        res.redirect('/admin/add-Second-Banner')
      }
    })
  })

})
router.get('/category-offer', async (req, res) => {
  let CategoryOffer = await adminHelper.getCategoryOffer()
  let categories = await adminHelper.categoryDetailes()
  res.render('admin/category-offer', { admin: true, categories, CategoryOffer })
})

router.post('/category-offer', (req, res) => {
  adminHelper.CategoryOffer(req.body)
  // console.log(req.body);
  res.redirect('/admin/category-offer')
})
router.get('/product-offer', async (req, res) => {
  let getProductOffer = await adminHelper.getProductOffer()
  let Products = await adminHelper.getAllProducts()
  res.render('admin/product-offer', { admin: true, getProductOffer, Products })
})
router.post('/product-offer', (req, res) => {
  adminHelper.ProductOffer(req.body)
  res.redirect('/admin/product-offer')
})

router.get('/product-report', async (req, res) => {
  let Products = await adminHelper.getAllProducts()
  res.render('admin/product-report', { admin: true, Products })
})
router.get('/order-report', async (req, res) => {
  Orders = await adminHelper.getAllOrders()
  res.render('admin/Order-report', { admin: true, Orders })
})
router.get('/sales-report', (req, res) => {
  // Sales=await adminHelper.getSales()
  res.render('admin/sales-report', { admin: true })
})
router.post('/sales-report', async (req, res) => {
  console.log(req.body);
  sales = await adminHelper.getSales(req.body)
  console.log(sales);
  res.render('admin/sales-report', { admin: true, sales })
})
router.get('/edit-banner/:id', async (req, res) => {
  let id = req.params.id
  let SingleBanner = await adminHelper.getSingleBanner(id)
  console.log(SingleBanner);
  res.render('admin/edit-banner', { admin: true, SingleBanner })

})
router.post('/edit-banner/:id', (req, res) => {
  let id = req.params.id
  
  adminHelper.updateBanner(id, req.body)
  res.redirect('/admin/banner-management')

    if (req.files.Image1) {
      let imageA = req.files.Image1
      imageA.mv('public/banner/' + id + '.jpg')
    }
   



})
router.get('/delete-banner/:id', (req, res) => {
  let id = req.params.id
  adminHelper.deleteBanner(id)
  res.redirect('/admin/banner-management')
})
router.get('/delete-offer/:id', (req, res) => {
  offerId = req.params.id
  adminHelper.deleteoffer(offerId).then((response) => {
    res.redirect('/admin/product-offer')
  })
})

router.get('/deleteCoupon-offer/:id', (req, res) => {
  offerId = req.params.id
  adminHelper.deleteCouponOffer(offerId).then((response) => {
    res.redirect('/admin/product-offer')
  })
})

router.get('/edit-category/:id', async (req, res) => {
  cId = req.params.id
  let SingleCategory = await adminHelper.getCategory(cId)
  console.log(SingleCategory);
  res.render('admin/edit-catogory', { admin: true, SingleCategory })
})
router.post('/edit-category/:id', (req, res) => {
  Cid = req.params.id
  adminHelper.updateCategory(Cid, req.body).then((response) => {
    res.redirect('/admin/view-category')
  })
})
router.get('/coupon-offer', async (req, res) => {
  Coupon = await adminHelper.getAllCoupons()
  res.render('admin/coupon_offer', { admin: true, Coupon })
})
router.post('/coupon-offer', (req, res) => {
  adminHelper.addCoupon(req.body)
  res.redirect('/admin/coupon-offer')
})
router.get('/deleteC-offer/:id', (req, res) => {
  let offerId = req.params.id
  adminHelper.deleteCategoryoffer(offerId).then((response) => {
    res.redirect('/admin/category-offer')
  })
})
router.get('/edit-proOffer/:id', async (req, res) => {
  let id = req.params.id
  let offerDetails = await adminHelper.editProOffer(id)
  console.log(offerDetails)

  res.render('admin/edit-product-offer', { admin: true, offerDetails })
})
router.post('/edit-product-offer/:id', (req, res) => {
  let id = req.params.id
  console.log(req.body);
  adminHelper.updateProOffer(req.body,id)
  res.redirect('/admin/product-offer')

})
