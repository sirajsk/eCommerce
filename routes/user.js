var express = require('express');
var router = express.Router();
var userHelper = require('../helpers/user-helpers')
var adminHelper = require('../helpers/admin-helpers');
const { response } = require('express');
const adminHelpers = require('../helpers/admin-helpers');
var paypal = require('paypal-rest-sdk');
const { Db } = require('mongodb');


const serviceSID = process.env.serviceSID
const accountSID = process.env.accountSID
const authTockon = process.env.authTockon

const client = require('twilio')(accountSID, authTockon)

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.client_id,
  'client_secret': process.env.client_secret
});


/* GET home page. */
const verifyUserLogin = (req, res, next) => {
  user = req.session.user
  if (user) {
    if (user.status) {
      next()
    }
    else {

      req.session.blockerr = true
      blockerr = req.session.blockerr

    }

  } else {
    res.redirect('/login')
  }
}
router.get('/', async function (req, res, next) {
  let user = req.session.user

  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id)
    // wishCount=await userHelper.getWishCount(req.session.user._id)
  }


  adminHelper.getAllProducts().then(async (products) => {


    Women = await adminHelper.getWomenProduct()
    // console.log(Women, 'women');
    Men = await adminHelper.getMenProduct()
    // console.log(Men, 'men');
    banner = await adminHelper.getFirstAllbanner()
    // console.log(banner);
    banner2 = await adminHelper.getSecondAllbanner()
    // console.log(banner2);   


    res.render('users/user-home', {  user, products, Isuser: true, cartCount, banner, banner2, Women, Men });
  })


});



// login page get
router.get('/login', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {

    res.render('users/user-login', { login: true, "loginErr": req.session.logginErr, Isuser: true });
    req.session.logginErr = false
  }

});

// login post
router.post('/login', function (req, res) {
  userHelper.dologin(req.body).then((response) => {

    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/otp');
    }
    else {
      req.session.logginErr = true
      res.redirect('/login')
    }

  })

});

// signup get
router.get('/signup', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/')
  }
  else {
    res.render('users/user-signup', { signup: true, Isuser: true });
  }

});
// otp start
// signup post
router.post('/signup', function (req, res) {
  userHelper.dosignup(req.body).then((user) => {


    client.verify

      .services(serviceSID)
      .verifications.create({
        to: `+91${req.body.mobile}`,
        channel: "sms"
      }).then((resp) => {
        req.session.number = resp.to

        // req.session.halflogIn=true
        res.redirect('/otp');
      }).catch((err) => {
        console.log(err);
      })

  })

});


router.get('/otp', (req, res) => {
  // console.log('on otp');
  // res.redirect('/')
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
  
    res.render('users/otp', { login: true, "invalidOtp": req.session.invalidOtp, Isuser: true })
    req.session.invalidOtp = false
  }


})
router.post('/otp', (req, res) => {
  let Lotp = Object.values(req.body.otp)
  let a = Lotp.join('')
  console.log(a);
  let number = req.session.number
  console.log(number);
  client.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: number,
      code: a
    }).then(async (resp) => {
      if (resp.valid) {
        let user = await userHelper.getUserdetails(number)
       
        req.session.loggedIn = true
        req.session.user = user
        res.redirect('/')
        

      } else {

        req.session.inavlidloginOtp = true
        res.redirect('/otp')
      }

    }).catch((err) => {

      req.session.inavlidloginOtp = true
      res.redirect('/otp')
    })


})
// otp end

// mobile otp starts

router.get('/otpM', (req, res) => {

  res.render('users/otpMobile', { login: true, "logininvalid": req.session.inavlidloginOtp, Isuser: true })
})
router.post('/otpM', (req, res) => {



  let Lotp = Object.values(req.body.otp)
  let a = Lotp.join('')

  let number = req.session.number

  client.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: number,
      code: a
    }).then(async (resp) => {
      if (resp.valid) {
        let user = await userHelper.getUserdetails(number)
        console.log(user,'user----------------------------------------');
        req.session.loggedIn = true
        res.redirect('/')
        req.session.user = user

      } else {

        req.session.inavlidloginOtp = true
        res.redirect('/otpM')
      }

    }).catch((err) => {

      req.session.inavlidloginOtp = true
      res.redirect('/otpM')
    })

  // res.redirect('/otpM')
})
router.get('/verifyMobile', (req, res) => {
  res.render('users/verifyMobile', { login: true, "invalidMobile": req.session.invalidMobile, Isuser: true })
})
router.post('/verifyMobile', (req, res) => {
  No = req.body.mobile
  console.log(No);
  Num=`+91${No}`
  userHelper.getUserdetails(Num).then((user) => {
    if (user) {

      req.session.user = user
      client.verify

        .services(serviceSID)
        .verifications.create({
          to: `+91${req.body.mobile}`,
          channel: "sms"
        }).then((resp) => {
          req.session.number = resp.to

          // req.session.halflogIn=true
          res.redirect('/otpM');
        }).catch((err) => {
          console.log(err);
        })
    } else {
      req.session.invalidMobile = true
      res.redirect('/verifyMobile');
    }
  })
  // res.redirect('/otp')
})

// mobile otp end

// cart start 
router.get('/cart', async function (req, res) {

  if (req.session.user) {
    let id = req.session.user._id
    let user = req.session.user
   
    let totals = await userHelper.getTotalAmount(id)



    cartCount = await userHelper.getCartCount(id)
    
    


    let products = await userHelper.getCartProducts(req.session.user._id)
    console.log(products);
    if (cartCount == 0) {
      res.render('users/cart-emptyPage', { user, Isuser: true, products, cart: true, totals, cartCount })
    }
    else {
      res.render('users/cart', { user, Isuser: true, products, cart: true, totals, cartCount });
    }


  } else {
    res.redirect('/login')
  }

});
router.get('/add-to-cart/:id', (req, res) => {
  if(req.session.user){
    userHelper.addToCart(req.params.id, req.session.user._id).then(() => {

      res.json({ status: true })
    }).catch((err) => {
      console.log(err);
    })
  }else{
    res.json({status:false})
  }
 
 

})
router.get('/add-to-Wish/:id', (req, res) => {
  if(req.session.user){
    userHelper.addToWish(req.params.id, req.session.user._id).then(() => {

      res.json({ status: true })
    }).catch((err) => {
      console.log(err);
    })
  }
  else{
    res.json({status:false})
  }
 

})

router.post('/delete-cart-item', (req, res) => {
  let cartId = req.body.cart
  let proId = req.body.product

  userHelper.deleteCartProduct(req.body).then((response) => {

    res.json(response)
  })
})


// cart end 



// logout get
router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.loggedIn = false
  res.redirect('/')
})



router.get('/resend-otp', (req, res) => {

  let number = req.session.number
  client.verify
    .services(serviceSID)
    .verifications.create({
      to: `${number}`,
      channel: "sms"
    }).then((response) => {

      req.session.user = response.user
      req.session.resend = true
      res.redirect('/otp')
    }).catch((err) => {

      req.session.otpErr = true
      res.redirect('/signup')
    })

})

router.get('/resendlogin-otp', (req, res) => {

  let number = req.session.number
  client.verify
    .services(serviceSID)
    .verifications.create({
      to: `${number}`,
      channel: "sms"
    }).then((response) => {

      req.session.user = response.user
      req.session.resend = true
      res.redirect('/otpM')
    }).catch((err) => {

      req.session.otpErr = true
      res.redirect('/login')
    })

})

// forgot start
router.get('/forgotOTP', (req, res) => {
  res.render('users/forgotOTP', { login: true, Isuser: true })
})
router.post('/forgotOTP', (req, res) => {

  res.redirect('/forgotOTP')

})
router.get('/resetP', (req, res) => {
  res.render('users/resetPassword', { login: true, Isuser: true })

})
router.get('/forgot', (req, res) => {

  res.render('users/forgotP', { login: true, Isuser: true })
})
router.post('/resetP', (req, res) => {
  res.redirect('/resetP')

})

router.post('/forgotSubmit', (req, res) => {
  res.redirect('/')
})


// forgot end

// change product quantity

router.post('/change-product-quantity', (req, res) => {
  console.log(req.body);
  userHelper.changeProductCount(req.body).then(async (response) => {
    id = req.session.user._id

    proId=req.body.product

    response.total = await userHelper.getTotalAmount(id)
    response.subTotal = await userHelper.getSubTotal(id, proId)

    console.log(response.subTotal,'res.res');

    res.json(response)
  })
})
// product detail page
router.get('/product-detail/:id', async (req, res) => {
  id = req.params.id

  user = req.session.user
  let cartCount = null
  let product = await userHelper.singleProduct(id)
  let AllProducts = await adminHelper.getAllProducts()
  if (user) {
    userId = req.session.user._id
    cartCount = await userHelper.getCartCount(userId)
  }




  res.render('users/product-detailes', { Isuser: true, product, AllProducts, user, cartCount })
})


// order start


router.get('/checkout', async (req, res) => {
  let userId = req.session.user._id
  let user = req.session.user
  let total = await userHelper.getTotalAmount(userId)
  let products = await userHelper.getCartProducts(userId)


  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  var address = null
  let status = await userHelper.addressChecker(req.session.user._id)

  if (status.address) {

    let addr = await userHelper.getUserAddress(req.session.user._id)

    let len = addr.length
    address = addr.slice(len - 2, len)
  }

  if (cartCount > 0) {
    res.render('users/placeOrder', { total, Isuser: true, cartCount, products, address, user })
  } else {
    req.session.noCartPro = true
    res.redirect('/cart')
  }

})
router.get('/add-new-add', (req, res) => {

  let user = req.session.user
  res.render('users/add-new-add', { Isuser: true, user })
})
router.post('/addNewAddress', (req, res) => {


  userHelper.addNewAddress(req.body).then((response) => {

    res.redirect('/checkout')
  })

})
router.post('/place-order', async (req, res) => {
  let id = req.session.user._id
  let products = await userHelper.getCartProductList(id)
  let total = 0
  if (req.session.Ctotal) {
    total = req.session.Ctotal
  } else {
    total = await userHelper.getTotalAmount(id)
  }


  console.log(req.session.total, 'session');
  userHelper.placeOrder(req.body, products, total).then((orderId) => {
    if (req.body['Payment'] == 'COD') {
      res.json({ codSuccess: true })
    } else if (req.body['Payment'] == 'Razorpay') {
      userHelper.generateRazorpay(orderId, total).then((resp) => {
        res.json({ resp, razorpay: true })
      })
    } else {
      val = total / 74
      total = val.toFixed(2)
      req.session.total = total
      console.log(total);
      var create_payment_json = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": "http://localhost:3000/success",
          "cancel_url": "http://localhost:3000/cancelled"
        },
        "transactions": [{
          "item_list": {
            "items": [{
              "name": "E-BUY",
              "sku": "007",
              "price": total,
              "currency": "USD",
              "quantity": 1
            }]
          },
          "amount": {
            "currency": "USD",
            "total": total
          },
          "description": "PAY LESS WEAR MORE"
        }]
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
              url = payment.links[i].href
              console.log(url);
              res.json({ url })
            }
          }
        }
      });
    }
  })
})

router.get('/success', (req, res) => {
  let val = req.session.total
  console.log(req.query);
  const paymentId = req.query.paymentId
  const payerId = req.query.PayerID

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": val
      }
    }]
  }
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      let id = req.session.user._id
      userHelper.changePaymentStatus(req.session.orderId).then(() => {
        res.redirect('/order-success')
      })
    }
  })

})


router.get('/order-success', (req, res) => {

  let user = req.session.user
  let userId = req.session.user._id
  userHelper.clearCart(userId)
  res.render('users/order-success', { Isuser: true, user })
})

router.get('/cancelled', (req, res) => {
  res.render('users/cancelled', { Isuser: true })
})
router.get('/orders', async (req, res) => {
  let user = req.session.user
  let id = req.session.user._id

  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  userHelper.getUserOrders(id).then(async(orders) => {
    // let id = req.session.user._id
    let len = orders.length
  //  let  Status=await userHelper.getOrderstatus(id)
  //  console.log(Status);
    if (orders.Status =='Delivered') {
     let Delivered = true
      res.render('users/user-orders', { Isuser: true, orders, cartCount, user, Delivered })
    }else{
      let Delivered = false
      res.render('users/user-orders', { Isuser: true, orders, cartCount, user, Delivered })
    }

    
  })


})
router.get('/singleOrder/:id', async (req, res) => {
  let user = req.session.user
  let oId = req.params.id

  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  adminHelpers.getOrderProducts(oId).then((products) => {
    console.log(products);
    res.render('users/single-orders', { Isuser: true, products, user, cartCount })
  })
})


// razorpay 
router.post('/verify-payment', (req, res) => {

  userHelper.verifyPayment(req.body).then(() => {

    userHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {

      res.json({ status: true })
    })
  }).catch((err) => {
    res.json({ status: false })
  })
})
router.get('/userProfile', async (req, res) => {
  id = req.session.user._id
 
  user = await userHelper.userProfile(id)
  let status = await userHelper.addressChecker(id)
  var address = null
  if (status.address) {


    let addr = await userHelper.getUserAddress(id)

    let len = addr.length
    address = addr.slice(len - 2, len)

    cartCount = await userHelper.getCartCount(id)
    res.render('users/userProfile', { Isuser: true,cartCount, user, address })

  } else {
    cartCount = await userHelper.getCartCount(id)
    res.render('users/userProfile', { Isuser: true,cartCount, user })
  }



})
router.get('/edit-U-Add/:id', async (req, res) => {
  user = req.session.user
  userId = req.session.user._id
  id = req.params.id
  address = await userHelper.singleAddress(userId, id)

  res.render('users/editUserAdd', { Isuser: true, address, user })
})

router.post('/edit-U-Add/:id', async (req, res) => {

  userId = req.session.user._id

  id = req.params.id

  userHelper.updateAddress(id, req.body, userId)

  res.redirect('/userProfile')


})
router.get('/change-address', async (req, res) => {

  userId = req.session.user._id
  detailes = await userHelper.changeAddress(userId)
  console.log(detailes);

  res.render('users/change-Address', { Isuser: true, detailes })
})
router.post('/change-address/:id', (req, res) => {

  id = req.params.id
  adminHelper.updateUAddress(id, req.body).then((response) => {
    res.redirect('/userProfile')
  })


})

router.get('/delete-U-Add/:id', (req, res) => {
  id = req.params.id
  userId = req.session.user._id
  userHelper.deleteAddress(userId, id).then(() => {
    console.log('dsfsdljfkdsfjdsfdskfdsfdskfjdskfdkfdksfjkdsjfkdsjfkdskfdkfdklfjksdjfldsfjd');
    res.redirect('/userProfile')
  })

})

router.get('/cancelled/:id', (req, res) => {
  status = 'Cancelled'
  adminHelper.changeOrderStatus(req.params.id, status).then(() => {
    res.redirect('/orders')
  })
})
router.get('/SingleCheckout/:id', async (req, res) => {
  let user = req.session.user
  if(user){
    let uId = req.session.user._id
    let id = req.params.id
    let PRODUCT = await userHelper.getSingleProduct(id)
    console.log(PRODUCT);
    let address = await userHelper.getUserAddress(uId)
    res.render('users/Single-checkout', { Isuser: true, PRODUCT, user, address })
  }else{
    res.redirect('/login')
  }
 
})

router.post('/placeSingle-order', async (req, res) => {
  // console.log('hi iam siraj');
  let pId = req.body.pId
  console.log(req.body.User);
  let id = req.session.user._id
  let products = await userHelper.getSingleProduct(pId)
  console.log(products, 'products');
  console.log(products.Price, 'price');
  // console.log(req.session.total, 'session');
  userHelper.SingleOrderPlace(req.body, products, products.Price).then((orderId) => {
    if (req.body['Payment'] == 'COD') {
      res.json({ codSuccess: true })
    } else if (req.body['Payment'] == 'Razorpay') {
      userHelper.generateRazorpay(orderId, products.Price).then((resp) => {
        res.json({ resp, razorpay: true })
      })
    } else {
      val = products.Price / 74
      total = val.toFixed(2)
      req.session.total = total
      console.log(total);
      var create_payment_json = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": "http://localhost:3000/success",
          "cancel_url": "http://localhost:3000/cancelled"
        },
        "transactions": [{
          "item_list": {
            "items": [{
              "name": "E-BUY",
              "sku": "007",
              "price": total,
              "currency": "USD",
              "quantity": 1
            }]
          },
          "amount": {
            "currency": "USD",
            "total": total
          },
          "description": "PAY LESS WEAR MORE"
        }]
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
              url = payment.links[i].href
              console.log(url);
              res.json({ url })
            }
          }
        }
      });
    }
  })
})

router.get('/success', (req, res) => {
  let val = req.session.total
  console.log(req.query);
  const paymentId = req.query.paymentId
  const payerId = req.query.PayerID

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": val
      }
    }]
  }
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      let id = req.session.user._id
      userHelper.changePaymentStatus(req.session.orderId).then(() => {
        res.redirect('/order-success')
      })
    }
  })

})
router.get('/wishlist', async (req, res) => {

  user = req.session.user
  if(user){
    userId = req.session.user._id

    products = await userHelper.getWishListPro(userId)
    WishCount = await userHelper.getWislistCount(userId)
    if(WishCount<=0){
      cartCount = await userHelper.getCartCount(userId)
      res.render('users/emptyWish',{ Isuser: true,cartCount, user })
    }else{
     
      cartCount = await userHelper.getCartCount(userId)
      res.render('users/wish-list', { Isuser: true, user,cartCount, products })
    }
   
  }else{
    res.redirect('/login')
  }
 
})

// router.get('detail-product/:id',(req,res)=>{

// })
// coupen start
router.post('/couponSubmit', (req, res) => {

  userHelper.couponValidate(req.body).then((response) => {

    req.session.Ctotal = response.total
    if (response.success) {
      console.log(response);
      res.json({ couponSuccess: true, total: response.total })
    }
    else if (response.couponUsed) {
      console.log(response);
      res.json({ couponUsed: true })
    } else if (response.couponExpired) {
      console.log(response);
      res.json({ couponExpired: true })
    } else if (response.invalidCoupon) {
      console.log(response);
      res.json({ invalidCoupon: true })
    }

  })

})

// coupen end
router.post('/delete-wish-item', (req, res) => {
  let wishId = req.body.wish
  let proId = req.body.product

  userHelper.deletewishProduct(req.body).then((response) => {

    res.json(response)
  })
})
router.get('/test',(req,res)=>{
  res.render('users/test444',{Isuser:true,login: true})
})
    

module.exports = router;