
const Toast = Swal.mixin({
  toast: true,
  position:'bottom-start',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})


function addTocart(proId) {

  $.ajax({

    // console.log(pro);
    url: "/add-to-cart/" + proId,
    method: 'get',
    success: (response) => {

      Toast.fire({
        icon: 'success',
        title: 'Added to cart'
      })
      if (response.status) {
        let count = $('#cart-count').html()
        count = parseInt(count) + 1
        $('#cart-count').html(count)
        $('#cart-countMobile').html(count)
       
      }

    }
  })
}
function addTowish(proId) {
  // console.log(proId);
  $.ajax({
    // console.log(pro);
    url: "/add-to-Wish/" + proId,
    method: 'get',
    success: (response) => {
      Toast.fire({
        icon: 'success',
        title: 'Added to Wishlist'
      })
      if (response.status) {
        
        console.log('hhhhh');
      }

    }
  })
}
