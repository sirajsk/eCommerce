
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

   
    url: "/add-to-cart/" + proId,
    method: 'get',
    success: (response) => {

     
      if (response.status) {
        let count = $('#cart-count').html()
        count = parseInt(count) + 1
        $('#cart-count').html(count)
        $('#cart-countMobile').html(count)
        Toast.fire({
          icon: 'success',
          title: 'Added to cart'
        })
       
      }else if(response.exist){
        Toast.fire({
          icon: 'success',
          title: 'Already exist'
        }) 
      }else{
        location.replace('/login')
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
     
      if (response.status) {
        Toast.fire({
          icon: 'success',
          title: 'Added to Wishlist'
        })
        console.log('hhhhh');
      }else if(response.pulled){
        Toast.fire({
          icon: 'error',
          title: 'removed from Wishlist'
        })
       
      }else{
        location.replace('/login')
      }

    }
  })
}
