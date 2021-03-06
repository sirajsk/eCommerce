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
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  let user = req.session.user
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id)
  }
  adminHelper.getAllProducts().then(async (products) => {
    Women = await adminHelper.getWomenProduct()
    Men = await adminHelper.getMenProduct()
    banner = await adminHelper.getFirstAllbanner()
    banner2 = await adminHelper.getSecondAllbanner()
    res.render('users/user-home', { user, products, Isuser: true, cartCount, banner, banner2, Women, Men });
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
    res.render('users/user-signup', { signup: true, Isuser: true, "mobileExist": req.session.userExist });
    req.session.userExist = false
  }
});
// otp start
// signup post
router.post('/signup', function (req, res) {

  let No = req.body.mobile
  let Mobile = `+91${No}`
  userHelper.getUserdetails(Mobile).then((user) => {
    if (user) {
      req.session.userExist = true
      res.redirect('/signup')
    } else {
      userHelper.dosignup(req.body).then((user) => {
        client.verify
          .services(serviceSID)
          .verifications.create({
            to: `+91${req.body.mobile}`,
            channel: "sms"
          }).then((resp) => {
            req.session.number = resp.to
            res.redirect('/otp');
          }).catch((err) => {
            console.log(err);
          })
      })
    }
  })
});


router.get('/otp', (req, res) => {

  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('users/otp', { login: true, "invalidOtp": req.session.invalidOtp, Isuser: true })
    req.session.invalidOtp = false
  }
})
router.post('/otp', (req, res) => {
  let a = req.body.otp
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
  let a = req.body.otp
  let number = req.session.number
  client.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: number,
      code: a
    }).then(async (resp) => {
      if (resp.valid) {
        let user = await userHelper.getUserdetails(number)
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
})

router.get('/verifyMobile', (req, res) => {
  res.render('users/verifyMobile', { login: true, "invalidMobile": req.session.invalidMobile, Isuser: true })
})

router.post('/verifyMobile', (req, res) => {
  No = req.body.mobile
  console.log(No);
  Num = `+91${No}`
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
          res.redirect('/otpM');
        }).catch((err) => {
          console.log(err);
        })
    } else {
      req.session.invalidMobile = true
      res.redirect('/verifyMobile');
    }
  })
})
// mobile otp end

// cart start 
router.get('/cart', async function (req, res) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
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
  if (req.session.user) {
    userHelper.addToCart(req.params.id, req.session.user._id).then((response) => {
      if (response.exist) {
        console.log('hi');
        res.json({ exist: true })
      } else {
        console.log('jjjsdsds');
        res.json({ status: true })
      }
    }).catch((err) => {
      console.log(err);
    })
  } else {
    res.json({ status: false })
  }
})

router.get('/add-to-Wish/:id', (req, res) => {
  if (req.session.user) {
    userHelper.addToWish(req.params.id, req.session.user._id).then((response) => {
      if (response.pulled) {
        console.log('pulled');
        res.json({ pulled: true })
      } else {
        res.json({ status: true })
      }
    }).catch((err) => {
      console.log(err);
    })
  }
  else {
    res.json({ status: false })
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
router.get('/forgotPw', (req, res) => {
  res.render('users/forgotmobile', { login: true, Isuser: true, "Nouser": req.session.NoUser })
  req.session.NoUser = false
})

router.post('/forgotOTP', (req, res) => {
  res.redirect('/resetP')
})

router.get('/resetP', (req, res) => {
  res.render('users/resetPassword', { login: true, Isuser: true, "NotSame": req.session.Password })
  req.session.Password = false
})

router.post('/resetP', (req, res) => {
  let No = `+91${req.body.mobile}`
  req.session.mobileNumber = No
  userHelper.getUserdetails(No).then((user) => {
    if (user) {
      res.redirect('/resetP')
    } else {
      req.session.NoUser = true
      res.redirect('/forgotPw')
    }
  })
})

router.post('/forgotSubmit', (req, res) => {
  console.log('onhere');
  let number = req.session.mobileNumber
  let firstPw = req.body.first
  let reEnterPw = req.body.second
  if (firstPw === reEnterPw) {
    userHelper.setPassword(number, firstPw).then((response) => {
      console.log('on function');
      res.redirect('/login')
    })
  }
  else {
    req.session.Password = true
    res.redirect('/resetP')
  }
})
// forgot end

// change product quantity
router.post('/change-product-quantity', (req, res) => {
  console.log(req.body);
  userHelper.changeProductCount(req.body).then(async (response) => {
    id = req.session.user._id
    proId = req.body.product
    response.total = await userHelper.getTotalAmount(id)
    response.subTotal = await userHelper.getSubTotal(id, proId)
    res.json(response)
  })
})

// product detail page
router.get('/product-detail/:id', async (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
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
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  let user = req.session.user
  if (user) {
    let userId = req.session.user._id
    let cartCount = null
    if (req.session.user) {
      let Id = req.session.user._id
      cartCount = await userHelper.getCartCount(Id)
    }
    let total = await userHelper.getTotalAmount(userId)
    let products = await userHelper.getCartProducts(userId)
    let productLength = products.length
    var address = null
    let status = await userHelper.addressChecker(req.session.user._id)
    if (status.address) {
      let addr = await userHelper.getUserAddress(req.session.user._id)
      let len = addr.length
      address = addr.slice(len - 2, len)
    }
    if (productLength > 0) {
      res.render('users/placeOrder', { total, Isuser: true, cartCount, products, address, user })
    } else {
      req.session.noCartPro = true
      res.redirect('/cart')
    }
  } else {
    res.redirect('/login')
  }
})

router.get('/add-new-add', async (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  let user = req.session.user
  res.render('users/add-new-add', { Isuser: true, user, cartCount })
})

router.post('/addNewAddress', (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  userHelper.addNewAddress(req.body).then((response) => {
    res.redirect('/checkout')
  })
})

router.get('/add-new-profile-add', async (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  let user = req.session.user
  res.render('users/addProfileAddress', { Isuser: true, user, cartCount })
})

router.post('/add-new-profile-add', (req, res) => {
  userHelper.addNewAddress(req.body).then((response) => {
    res.redirect('/userProfile')
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
          "return_url": "https://skebuy.ml/success",
          "cancel_url": "https://skebuy.ml/cancelled"
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


router.get('/order-success', async (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  let user = req.session.user
  let userId = req.session.user._id
  userHelper.clearCart(userId)
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  res.render('users/order-success', { Isuser: true, user, cartCount })
})

router.get('/cancelled', async (req, res) => {
  let user = req.session.user
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  res.render('users/cancelled', { Isuser: true, user, cartCount })
})

router.get('/orders', async (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  let user = req.session.user
  let id = req.session.user._id
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  let orederCount = null
  if (req.session.user) {
    let id = req.session.user._id
    orederCount = await userHelper.getOrderCount(id)
  }
  if (orederCount <= 0) {

    res.render('users/emptyOrder', { Isuser: true, cartCount, user })
  } else {
    userHelper.getUserOrders(id).then(async (orders) => {
      let len = orders.length
      if (orders.Status == 'Delivered') {
        let Delivered = true
        res.render('users/user-orders', { Isuser: true, orders, cartCount, user, Delivered })
      } else {
        let Delivered = false
        res.render('users/user-orders', { Isuser: true, orders, cartCount, user, Delivered })
      }
    })
  }
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
    console.log(products,'products');
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
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  id = req.session.user._id
  user = await userHelper.userProfile(id)
  let status = await userHelper.addressChecker(id)
  var address = null
  if (status.address) {
    let addr = await userHelper.getUserAddress(id)
    let len = addr.length
    address = addr.slice(len - 2, len)
    cartCount = await userHelper.getCartCount(id)
    res.render('users/userProfile', { Isuser: true, cartCount, user, address })
  } else {
    cartCount = await userHelper.getCartCount(id)
    res.render('users/userProfile', { Isuser: true, cartCount, user })
  }
})

router.get('/edit-U-Add/:id', async (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  user = req.session.user
  userId = req.session.user._id
  id = req.params.id
  address = await userHelper.singleAddress(userId, id)
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  res.render('users/editUserAdd', { Isuser: true, address, user, cartCount })
})

router.post('/edit-U-Add/:id', async (req, res) => {
  userId = req.session.user._id
  id = req.params.id
  userHelper.updateAddress(id, req.body, userId)
  res.redirect('/userProfile')
})

router.get('/change-address', async (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  let user = req.session.user
  userId = req.session.user._id
  detailes = await userHelper.changeAddress(userId)
  let no = detailes.mobile
  detailes.mobile = no.slice(3, 13)
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  res.render('users/change-Address', { Isuser: true, detailes, cartCount, user })
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
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  let user = req.session.user
  if (user) {
    let cartCount = null
    if (req.session.user) {
      let Id = req.session.user._id
      cartCount = await userHelper.getCartCount(Id)
    }
    let uId = req.session.user._id
    let id = req.params.id
    let PRODUCT = await userHelper.getSingleProduct(id)
    console.log(PRODUCT);
    let address = await userHelper.getUserAddress(uId)
    res.render('users/Single-checkout', { Isuser: true, PRODUCT, user, address, cartCount })
  } else {
    res.redirect('/login')
  }
})

router.post('/placeSingle-order', async (req, res) => {
  let pId = req.body.pId
  console.log(req.body.User);
  let id = req.session.user._id
  let products = await userHelper.getbuyNowProduct(pId)
  console.log(products, 'products');
  console.log(products.Price, 'price');
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
          "return_url": "https://skebuy.ml/success",
          "cancel_url": "https://skebuy.ml/cancelled"
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
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  user = req.session.user
  if (user) {
    userId = req.session.user._id
    products = await userHelper.getWishListPro(userId)
    WishCount = await userHelper.getWislistCount(userId)
    if (WishCount <= 0) {
      cartCount = await userHelper.getCartCount(userId)
      res.render('users/emptyWish', { Isuser: true, cartCount, user })
    } else {
      cartCount = await userHelper.getCartCount(userId)
      res.render('users/wish-list', { Isuser: true, user, cartCount, products })
    }
  } else {
    res.redirect('/login')
  }

})

// coupen start
router.post('/couponSubmit', (req, res) => {
  let id = req.session.user._id
  userHelper.couponValidate(req.body, id).then((response) => {
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
router.get('/test', (req, res) => {
  res.render('users/test444', { Isuser: true, login: true })
})


module.exports = router;