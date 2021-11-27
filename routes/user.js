var express = require('express');
var router = express.Router();
var userHelper = require('../helpers/user-helpers')
var adminHelper = require('../helpers/admin-helpers');
const { response } = require('express');
const adminHelpers = require('../helpers/admin-helpers');


const serviceSID = process.env.serviceSID
const accountSID = process.env.accountSID
const authTockon = process.env.authTockon

const client = require('twilio')(accountSID, authTockon)


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
  }

  adminHelper.getAllProducts().then((products) => {



    res.render('users/user-home', { user, products, Isuser: true, cartCount });
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

  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('users/otp', { login: true, "invalidOtp": req.session.invalidOtp, Isuser: true })
    req.session.invalidOtp = false
  }


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

  userHelper.getUserdetails(No).then((user) => {
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
    // let Subtotal=await userHelper.getSubTotal(id)
    let totals = await userHelper.getTotalAmount(id)                                       



    cartCount = await userHelper.getCartCount(id)

    let products = await userHelper.getCartProducts(req.session.user._id)
    res.render('users/cart', { user, Isuser: true, products, cart: true, totals, cartCount });

  } else {
    res.redirect('/login')
  }

});
router.get('/add-to-cart/:id', (req, res) => {

  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {

    res.json({ status: true })
  }).catch((err) => {
    console.log(err);
  })

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
  userHelper.changeProductCount(req.body).then(async (response) => {
    id = req.session.user._id
    response.total = await userHelper.getTotalAmount(id)

    res.json(response)
  })
})
// product detail page
router.get('/product-detail/:id', async (req, res) => {
  id = req.params.id
  userId = req.session.user._id
  user = req.session.user
  let cartCount = null
  let product = await userHelper.singleProduct(id)
  let AllProducts = await adminHelper.getAllProducts()
  cartCount = await userHelper.getCartCount(userId)

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
  // console.log('ldhfjsgdfjgsdjfgsdgfjsdhgfjhsdgshdfsdhjfg');
  let id = req.session.user._id
  let products = await userHelper.getCartProductList(id)
  let total = await userHelper.getTotalAmount(id)
  userHelper.placeOrder(req.body, products, total).then((orderId) => {
    if (req.body['Payment'] == 'COD') {
      res.json({ codSuccess: true })
    } else {
      userHelper.generateRazorpay(orderId, total).then((response) => {

        res.json(response)

      })
    }


  })
})
router.get('/order-success', (req, res) => {
  res.render('users/order-success', { Isuser: true })
})
router.get('/orders', async (req, res) => {
  let user = req.session.user
  let id = req.session.user._id

  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  userHelper.getUserOrders(id).then((orders) => {

    let len = orders.length

    res.render('users/user-orders', { Isuser: true, orders, cartCount, user })
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


    res.render('users/userProfile', { Isuser: true, user, address })

  }else{
    res.render('users/userProfile', { Isuser: true, user })
  }



})
// router.get('/edit-U-Add/:id',async(req,res)=>{
//   user=req.session.user
//   userId=req.session.user._id
//   id=req.params.id
//  address= await userHelper.singleAddress(userId,id)
 
//   res.render('users/editUserAdd',{Isuser:true,address,user})
// })

// router.post('/edit-U-Add/:id',async(req,res)=>{

//   userId=req.session.user._id

//   id=req.params.id

//   userHelper.updateAddress(id,req.body,userId)

//   res.redirect('/userProfile')


// })

module.exports = router;